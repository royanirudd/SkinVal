import { auth } from "@/lib/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const userDetails = auth.currentUser;
  console.log("user", userDetails);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user || !user.email) {
      toast.error("User is not properly authenticated.");
      return;
    }

    setLoading(true);

    const provider = user.providerId;

    if (newPassword !== confirmPassword) {
      toast.error("New password and Confirm password not matched!");
      setLoading(false);
      setCurrentPassword("");
      setConfirmPassword("");
      setNewPassword("");
      return;
    }

    if (provider !== "firebase") {
      toast.message(
        "You cannot change your password here. Please update it via your provider."
      );
      setLoading(false);
      setCurrentPassword("");
      setConfirmPassword("");
      setNewPassword("");
      return;
    }

    if (user) {
      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);

        setCurrentPassword("");
        setNewPassword("");
        toast.message("Password updated successfully!");
      } catch (error: any) {
        console.log(error.message);
        toast.message(error.message);
      }
    }
  };

  return (
    <form
      onSubmit={handleChangePassword}
      className="md:w-[60%] mx-auto md:mx-0 h-auto text-black flex flex-col gap-2 items-center justify-center mt-10"
    >
      <div className="flex flex-col gap-1">
        <span className="text-black/75 text-sm">Current password</span>
        <input
          type="password"
          value={currentPassword}
          className="w-60 border border-zinc-700 rounded-md  p-2 focus:outline-none"
          minLength={6}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1 text-sm">
        <span className="text-black/70">New password</span>
        <input
          type="password"
          value={newPassword}
          className="w-60 border border-zinc-700 rounded-md  p-2 text-base focus:outline-none"
          minLength={6}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-black/70">confirm password</span>
        <input
          type="text"
          className="w-60 border border-zinc-700 rounded-md  p-2 focus:outline-none"
          required
          minLength={6}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-60 h-10 p-2 bg-black text-white rounded-md flex mt-5 justify-center items-center"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Change password"
        )}
      </button>
    </form>
  );
};

export default Settings;
