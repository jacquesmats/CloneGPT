"use client";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#536DFE",
    },
    secondary: {
      main: "#90CAF9",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
