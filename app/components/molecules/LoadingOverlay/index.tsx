import { Spinner } from "@/app/components";

const LoadingOverlay = () => {
  return (
      <div 
        className="flex min-h-screen items-center justify-center bg-background-muted"
        suppressHydrationWarning
      >
        <Spinner size="lg" />
      </div>
  );
};

export default LoadingOverlay;