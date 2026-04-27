import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";

// Variables starting with "mock" are hoisted by Jest alongside jest.mock(),
// making them accessible inside the factory function below.
const mockSend = jest.fn();
const mockClose = jest.fn();
let mockWsInstance;

jest.mock("websocket", () => {
  const MockW3CWebSocket = jest.fn(() => {
    mockWsInstance = {
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
      readyState: 1,
      send: mockSend,
      close: mockClose,
    };
    return mockWsInstance;
  });
  MockW3CWebSocket.OPEN = 1;
  return { w3cwebsocket: MockW3CWebSocket };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockWsInstance = null;
});

describe("App — initial render", () => {
  test("renders the page heading", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /websocket client/i })
    ).toBeInTheDocument();
  });

  test("shows Disconnected status before connection opens", () => {
    render(<App />);
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  test("shows placeholder text when no messages have arrived", () => {
    render(<App />);
    expect(
      screen.getByText(/no messages received yet/i)
    ).toBeInTheDocument();
  });

  test("renders all three command buttons", () => {
    render(<App />);
    expect(
      screen.getByRole("button", { name: /forward/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /backwards/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /auto/i })
    ).toBeInTheDocument();
  });

  test("all command buttons are disabled before connection opens", () => {
    render(<App />);
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});

describe("App — after connection opens", () => {
  function renderConnected() {
    render(<App />);
    act(() => {
      mockWsInstance.onopen();
    });
  }

  test("shows Connected status", () => {
    renderConnected();
    expect(screen.getByText(/connected/i)).toBeInTheDocument();
  });

  test("enables all command buttons", () => {
    renderConnected();
    screen.getAllByRole("button").forEach((btn) => {
      expect(btn).not.toBeDisabled();
    });
  });

  test("sends correct JSON when Forward is clicked", () => {
    renderConnected();
    fireEvent.click(screen.getByRole("button", { name: /forward/i }));
    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({ type: "message", msg: "forward" })
    );
  });

  test("sends correct JSON when Backwards is clicked", () => {
    renderConnected();
    fireEvent.click(screen.getByRole("button", { name: /backwards/i }));
    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({ type: "message", msg: "backwards" })
    );
  });

  test("sends correct JSON when AUTO is clicked", () => {
    renderConnected();
    fireEvent.click(screen.getByRole("button", { name: /auto/i }));
    expect(mockSend).toHaveBeenCalledWith(
      JSON.stringify({ type: "message", msg: "auto" })
    );
  });
});

describe("App — receiving messages", () => {
  test("displays a received message", () => {
    render(<App />);
    act(() => {
      mockWsInstance.onopen();
      mockWsInstance.onmessage({ data: "Hello from server" });
    });
    expect(screen.getByText("Hello from server")).toBeInTheDocument();
  });

  test("displays multiple received messages in order", () => {
    render(<App />);
    act(() => {
      mockWsInstance.onopen();
      mockWsInstance.onmessage({ data: "First" });
      mockWsInstance.onmessage({ data: "Second" });
      mockWsInstance.onmessage({ data: "Third" });
    });
    const items = screen.getAllByText(/First|Second|Third/);
    expect(items).toHaveLength(3);
  });

  test("hides the placeholder once a message arrives", () => {
    render(<App />);
    act(() => {
      mockWsInstance.onopen();
      mockWsInstance.onmessage({ data: "ping" });
    });
    expect(
      screen.queryByText(/no messages received yet/i)
    ).not.toBeInTheDocument();
  });
});

describe("App — connection lifecycle", () => {
  test("shows Disconnected after connection closes", () => {
    render(<App />);
    act(() => {
      mockWsInstance.onopen();
    });
    act(() => {
      mockWsInstance.onclose();
    });
    expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
  });

  test("shows an error message when a connection error occurs", () => {
    render(<App />);
    act(() => {
      mockWsInstance.onerror();
    });
    expect(screen.getByText(/connection error/i)).toBeInTheDocument();
  });

  test("closes the WebSocket when the component unmounts", () => {
    const { unmount } = render(<App />);
    unmount();
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});
