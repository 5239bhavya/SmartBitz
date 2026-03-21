import React, { useState, useRef, useCallback } from "react";
import { Lock, Camera, CheckCircle2, ScanFace, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Webcam from "react-webcam";

export const FaceAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const startScan = () => {
    setIsScanning(true);
  };

  const captureAndVerify = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to access camera. Please check permissions.");
      setIsScanning(false);
      return;
    }

    // Simulate AI Face Verification Process
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsScanning(false);
      setIsAuthenticated(true);
      toast.success("Identity verified successfully!");
    }, 2000);
  }, [webcamRef]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20 min-h-[400px]">
      {!isScanning ? (
        <>
          <Lock className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground mb-6 text-center max-w-sm">
            Please verify your identity using your device camera to view
            sensitive cash flow operations.
          </p>
          <Button onClick={startScan} className="gap-2">
            <ScanFace className="w-5 h-5" />
            Start Face Scan
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md">
          <h3 className="text-xl font-semibold mb-4">
            Position your face in the frame
          </h3>

          <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-primary/20 aspect-video w-full bg-black mb-6">
            {!isAnalyzing ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                mirrored={true}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10 transition-all">
                <ScanFace className="w-16 h-16 text-primary animate-pulse mb-4" />
                <p className="text-primary font-medium tracking-widest uppercase text-sm">
                  Analyzing Biometrics...
                </p>
                {/* Scanning Laser Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.8)] animate-scan-line"></div>
              </div>
            )}

            {/* Camera Overlay Guides */}
            {!isAnalyzing && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border-[2px] border-primary/30 rounded-lg"></div>
                {/* Reticle corners */}
                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
              </div>
            )}
          </div>

          <div className="flex gap-4 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsScanning(false)}
              disabled={isAnalyzing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={captureAndVerify}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
              {isAnalyzing ? "Verifying..." : "Verify Identity"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
