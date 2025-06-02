export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold mb-4">404 – Page Not Found</h1>
      <p className="text-lg text-gray-500">
        Sorry, we couldn't find what you were looking for.
      </p>
      <a href="/" className="mt-6 text-blue-500 underline">
        Back to Home
      </a>
    </div>
  );
}
