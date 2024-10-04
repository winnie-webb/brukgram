import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import TabNav from "./components/TabNav";

export const metadata = {
  title: "Brukgram",
  description:
    "An instagram alternative 😉. Full social media web application ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <AuthProvider>
          {children}
          <TabNav></TabNav>
        </AuthProvider>
      </body>
    </html>
  );
}
