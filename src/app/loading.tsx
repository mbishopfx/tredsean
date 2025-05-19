export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-tech-background">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-tech-foreground">Loading...</h2>
        <p className="text-sm text-gray-400 mt-2">Please wait while we prepare your content</p>
      </div>
    </div>
  );
} 