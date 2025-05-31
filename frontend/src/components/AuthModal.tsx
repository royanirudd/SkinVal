import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface AuthModalPropTypes {
  onClose: () => void;
}

function AuthModal({ onClose }: AuthModalPropTypes) {
  return (
    <section className="w-full h-screen fixed top-0 left-0 flex justify-center items-center bg-[#1a1a1a]/70 z-50 p-5 backdrop-blur-xs">
      <X
        onClick={onClose}
        className="absolute top-5 right-5 size-10 text-black rounded-full  bg-white  p-1 cursor-pointer"
      />
      <div className="w-full md:w-[60%] lg:w-[60%] lg:h-[80%] border rounded-3xl bg-white flex flex-col md:flex-row gap-4">
        <div className="lg:w-[50%] h-full w-full flex flex-col gap-4 p-5">
          <h1 className="text-md md:text-2xl md:mb-[2vh]">Welcome !</h1>
          <p>
            To generate your personalized skincare routine with the help of our
            AI, please log in or create an account.
          </p>
          <p>Let’s get started on your journey to healthier, glowing skin.</p>
          <Link href="/login">
            <button className="w-full flex justify-center items-center py-2 rounded-full bg-[#1a1a1a] text-white mt-[2vh]">
              Login
            </button>
          </Link>
          <Link href="/signup">
            <button className="w-full flex justify-center items-center py-2 rounded-full bg-[#1a1a1a] text-white">
              Sign up
            </button>
          </Link>
        </div>
        <div className="lg:w-[50%] h-full hidden lg:flex">
          <Image
            className="w-full h-full bg-cover bg-center rounded-r-3xl "
            src="/products.jpg"
            alt="products"
            width={500}
            height={500}
          />
        </div>
      </div>
    </section>
  );
}

export default AuthModal;
