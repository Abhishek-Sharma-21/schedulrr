import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import CreateEventDrawer from "@/components/create-events";

export const metadata = {
  title: "My Schedulrr",
  description: "Meeting Scheduling App",
};
const inter = Inter({ subsets: ["latin"] });
export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {/* <Header /> */}
          <Header />
          <main className="min-h-screen bg-gradient-to-b from-red-200 to-white">
            {children}
          </main>
          {/* Footer */}
          <footer className="bg-red-100 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made With ❤️ by Your Favourite Person</p>
            </div>
          </footer>
          <CreateEventDrawer />
        </body>
      </html>
    </ClerkProvider>
  );
}
