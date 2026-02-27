import './globals.css';

export const metadata = {
  title: 'Room Rental Management System',
  description: 'Room rental management and billing system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Room Rental Management System</title>
        <meta name="description" content="Room rental management and billing system" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
