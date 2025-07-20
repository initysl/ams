import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader, AlertTriangle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface DeleteProfileProps {
  className?: string;
}

const DeleteProfile = ({ className = "" }: DeleteProfileProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [step, setStep] = useState<"initial" | "confirm" | "final">("initial");

  const { user, logout } = useAuth();
  const deleteText = "DELETE";

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete("user/profile/delete", {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Account deleted successfully");
      // Logout user and redirect
      logout();
    },
    onError: (error: any) => {
      // console.error("Delete error:", error);
      let message = "Failed to delete account.";

      if (error?.response?.data?.message) {
        const errorData = error.response.data.message;
        if (Array.isArray(errorData)) {
          message = errorData
            .map((err: any) => err.msg || err.message || err)
            .join(", ");
        } else {
          message = errorData;
        }
      }

      toast.error(message);
    },
  });

  const handleDelete = () => {
    if (confirmationText !== deleteText) {
      toast.error(`Please type "${deleteText}" to confirm`);
      return;
    }
    deleteMutation.mutate();
  };

  const resetDialog = () => {
    setStep("initial");
    setConfirmationText("");
    setIsOpen(false);
  };

  const handleNext = () => {
    if (step === "initial") {
      setStep("confirm");
    } else if (step === "confirm") {
      setStep("final");
    }
  };

  const handleBack = () => {
    if (step === "confirm") {
      setStep("initial");
    } else if (step === "final") {
      setStep("confirm");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className={`w-full sm:w-auto px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white ${className}`}
          onClick={() => setIsOpen(true)}
        >
          Delete Profile
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md bg-white">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle className="text-lg font-semibold">
                {step === "initial" && "Delete Account"}
                {step === "confirm" && "Are you absolutely sure?"}
                {step === "final" && "Final Confirmation"}
              </AlertDialogTitle>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogDescription className="text-sm text-gray-600 space-y-3">
          {step === "initial" && (
            <div className="space-y-3">
              <p>
                You are about to permanently delete your profile. This action
                cannot be undone.
              </p>
              <div className="bg-red-50 p-3 rounded-md border-l-4 border-red-400">
                <p className="font-medium text-red-800">
                  What will be deleted:
                </p>
                <ul className="mt-2 text-red-700 text-sm space-y-1">
                  <li>Your profile information</li>
                  <li>All associated data</li>
                  <li>Access to your profile</li>
                </ul>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-3">
              <p>
                This will permanently delete the profile for{" "}
                <strong>{user?.email}</strong> and all associated data.
              </p>
              <p className="font-medium text-red-800">
                This action is irreversible. Are you sure you want to continue?
              </p>
            </div>
          )}

          {step === "final" && (
            <div className="space-y-4">
              <p>
                To confirm deletion, please type{" "}
                <strong className="font-mono bg-gray-100 px-1 rounded">
                  {deleteText}
                </strong>{" "}
                below:
              </p>
              <Input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder={`Type "${deleteText}" to confirm`}
                className="font-mono"
                autoFocus
              />
              {confirmationText && confirmationText !== deleteText && (
                <p className="text-red-500 text-xs">
                  Please type "{deleteText}" exactly as shown
                </p>
              )}
            </div>
          )}
        </AlertDialogDescription>

        <AlertDialogFooter className="flex gap-2">
          {step !== "initial" && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={deleteMutation.isPending}
            >
              Back
            </Button>
          )}

          <AlertDialogCancel
            onClick={resetDialog}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </AlertDialogCancel>

          {step !== "final" ? (
            <Button
              onClick={handleNext}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Continue
            </Button>
          ) : (
            <AlertDialogAction
              onClick={handleDelete}
              disabled={
                confirmationText !== deleteText || deleteMutation.isPending
              }
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
            >
              {deleteMutation.isPending ? (
                <>
                  Deleting
                  <Loader className="animate-spin h-4 w-4 ml-2" />
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProfile;
