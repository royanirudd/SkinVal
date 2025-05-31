import { useAuth } from "@/app/context/AuthContext";
import { auth } from "@/lib/firebase";
import { Loader2, UserRoundPlus } from "lucide-react";
import { useEffect, useState } from "react";

const Personal = () => {
  const { user } = useAuth();

  return (
    <div className="md:w-[60%] h-auto mx-auto md:mx-0 text-black flex flex-col gap-3 items-center justify-center">
      <div className="w-20 h-20 mx-auto border border-black rounded-full flex justify-center items-center">
        <UserRoundPlus className="size-10 text-zinc-600" />
      </div>
      <div className="w-fit h-auto mx-auto flex flex-col gap-4 p-5">
        {user ? (
          <>
            <p>Name :- {user.displayName}</p>
            <p>Email :- {user.email}</p>
          </>
        ) : (
          <p>
            <Loader2 className="size-6 font-thin te animate-spin" />
          </p>
        )}
      </div>
    </div>
  );
};

export default Personal;
