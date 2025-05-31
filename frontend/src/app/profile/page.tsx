"use client";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Settings from "./profile-components/Settings";
import Personal from "./profile-components/Personal";

function Profile() {
  const router = useRouter();
  const [state, setState] = useState("personal");

  const { user, authloading } = useAuth();

  useEffect(() => {
    if (!authloading && !user) {
      router.replace("/"); // or whatever your login route is
    }
  }, [user, authloading, router]);

  if (!user) {
    return null; // This is temporary before redirect happens
  }

  return (
    <section className="w-full h-screen border text-black font-normal overflow-hidden relative">
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30 -z-10"
        style={{ backgroundImage: "url('/textured.jpg')" }}
      />
      <Link
        href="/"
        className="w-full h-auto flex justify-end items-center p-5 underline underline-offset-2"
      >
        back to page
      </Link>

      <div className="w-[90%] h-auto mx-auto flex flex-col gap-3">
        <div className="w-full h-auto flex justify-between items-center mt-10  pb-5 border-b border-black">
          <h1 className="text-4xl ">Skinval</h1>
          <button
            onClick={() => signOut(auth)}
            className="text-xl px-8 py-2 bg-zinc-800 text-white rounded-full cursor-pointer"
          >
            Log out
          </button>
        </div>
        <div className="w-full flex flex-col md:flex-row">
          <div className="w-full md:w-[30%] h-full flex items-center justify-center md:flex-col text-sm md:text-base gap-3 border-b md:border-b-0 md:border-r mb-10 md:mb-0 pb-3 md:pb-0 md:p-2 border-black">
            <p
              onClick={() => setState("personal")}
              className={`border hover:border-black text-center rounded-xl md:rounded-full w-full p-1 md:p-4  ${
                state === "personal" ? "border-black" : " border-transparent"
              }`}
            >
              Personal Info
            </p>
            <p
              onClick={() => setState("symptoms")}
              className={`border  hover:border-black text-center rounded-xl md:rounded-full w-full p-1 md:p-4 ${
                state === "symptoms" ? "border-black" : " border-transparent"
              }`}
            >
              Symptoms
            </p>
            <p
              onClick={() => setState("password")}
              className={`border hover:border-black text-center rounded-xl md:rounded-full w-full p-1 md:p-4 ${
                state === "password" ? "  border-black" : " border-transparent"
              }`}
            >
              Settings
            </p>
          </div>
          {state === "personal" ? (
            <Personal />
          ) : state === "password" ? (
            <Settings />
          ) : (
            <div className="w-[60%] flex justify-center items-center">
              Coming soon...
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Profile;
