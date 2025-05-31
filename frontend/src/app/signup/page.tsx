"use client";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

function Signup() {
  const [displayName, setDispalyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPopUpLoading, setIsPopUpLoading] = useState(false);

  const { user, authloading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!authloading && user) {
      router.replace("/"); // Redirect to home if logged in
    }
  }, [user, authloading, router]);

  if (authloading || user) {
    return null; // Or a loading spinner if you prefer
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", userCred.user.uid), {
        email,
        displayName,
        createdAt: new Date(),
      });

      router.push("/login");
    } catch (error: any) {
      toast(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isPopUpLoading) {
      return;
    }

    setIsPopUpLoading(true);

    try {
      const userCred = await signInWithPopup(auth, googleProvider);

      router.push("/");
    } catch (error: any) {
      toast.message(error.message);
    } finally {
      setIsPopUpLoading(false);
    }
  };

  return (
    <section className="w-full min-h-[100svh] relative flex flex-col">
      <div
        className="absolute inset-0 bg-no-repeat bg-center bg-cover opacity-30 -z-10"
        style={{ backgroundImage: "url('/textured.jpg')" }}
      ></div>
      <div className="w-full h-fit pt-5 px-5 lg:px-10 flex justify-between items-center">
        <h1 className="text-cyan-500 font-semibold text-4xl tracking-wider relative w-fit lg:px-6 lg:py-2 rounded-full">
          sk
          <span className="relative inline-block">
            ı
            <span className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full bg-red-600" />
          </span>
          nval
        </h1>
        <Link href="/" className="underline underline-offset-4">
          back to page
        </Link>
      </div>
      <div className="flex-grow w-full h-full flex justify-center items-center">
        <div className="w-full flex flex-col gap-4 items-center text-center p-5">
          <h2 className="text-3xl lg:mb-4">Create your account</h2>
          <form
            className="w-full flex flex-col gap-4 items-center text-center "
            onSubmit={handleSignUp}
          >
            <input
              type="text"
              value={displayName}
              className="w-full  md:w-[50vw] lg:w-[30vw] rounded-full border border-black p-2"
              placeholder="Name"
              minLength={3}
              onChange={(e) => setDispalyName(e.target.value)}
              required
            />
            <input
              type="email"
              value={email}
              className="w-full md:w-[50vw] lg:w-[30vw] rounded-full border border-black p-2"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="w-full md:w-[50vw] lg:w-[30vw] rounded-full border border-black p-2"
              placeholder="Password"
              minLength={6}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full  md:w-[50vw] lg:w-[30vw] rounded-full bg-[#1a1a1a] text-white p-2 flex justify-center items-center disabled:cursor-wait cursor-pointer"
            >
              {loading ? (
                <Loader2 className="size-6 animate-spin" />
              ) : (
                "Sign up"
              )}
            </button>
          </form>
          <p className="text-sm">
            Already have an account ?{" "}
            <Link href="/login">
              <span className="cursor-pointer">Login</span>
            </Link>
          </p>
          <div>or</div>
          <button
            onClick={handleGoogleSignUp}
            className="w-full md:w-[50vw] lg:w-[30vw] rounded-full border border-black p-2 flex justify-center items-center gap-4 cursor-pointer"
          >
            <Image
              className="size-5"
              src="/google icon.jpeg"
              alt="Google Icon"
              width={100}
              height={100}
            />
            Google
          </button>
        </div>
      </div>
      <p className="w-full flex justify-center lg:justify-end items-center pb-5 pr-10">
        simplify your skin care with skinval
      </p>
    </section>
  );
}

export default Signup;
