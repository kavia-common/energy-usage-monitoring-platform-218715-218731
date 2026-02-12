import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login screen when unauthenticated", () => {
  render(<App />);
  expect(screen.getByText(/LOGIN/i)).toBeInTheDocument();
});
