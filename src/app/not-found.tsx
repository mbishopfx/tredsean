import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-tech-background">
      <div className="w-full max-w-md space-y-8 p-10 bg-glass rounded-xl shadow-tech z-10 tech-border">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            <span className="text-primary">404</span>
          </h1>
          <h2 className="text-2xl font-semibold mt-2">Page Not Found</h2>
          <p className="mt-4 text-gray-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <button className="mt-6 px-4 py-2 bg-gradient text-white rounded-md hover:shadow-accent transition-shadow duration-300">
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
} 