import { ArrowUpRight, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Category } from "../types";
import { easeInOut } from "motion";
import { useState } from "react";
import { motion } from "motion/react";

interface recommendationTypeProps {
  recommendations: Category[];
}

function Recommendations({ recommendations }: recommendationTypeProps) {
  const [activeCategories, setActiveCategories] = useState<
    Record<number, boolean>
  >({
    0: true,
  });

  const handleCategoryClick = (index: number) => {
    setActiveCategories((prevState) => ({
      ...prevState,
      [index]: !prevState[index],
    }));
  };
  const variants = {
    open: {
      height: "auto",
      marginTop: "40px",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
    close: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
  };

  const rotate = {
    open: {
      rotate: 180,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
    closed: {
      rotate: 0,
      transition: {
        duration: 0.3,
        ease: easeInOut,
      },
    },
  };

  const MotionChevrons = motion.create(ChevronDown);

  return (
    <div className="w-full">
      <h1 className="text-3xl md:text-4xl text-[#1a1a1a] mb-8 mt-10">
        Personalized recommendations
      </h1>
      {recommendations.map((products, i) => (
        <div
          key={i}
          onClick={() => handleCategoryClick(i)}
          className={`w-full border-b p-5 hover:bg-[#1a1a1a] hover:text-white ${
            activeCategories[i]
              ? "bg-[#1a1a1a] text-white"
              : "bg-white text-[#1a1a1a]"
          }`}
        >
          <div className="w-full flex justify-between items-center">
            <h1 className="text-lg md:text-xl tracking-wide">
              {products.category}
            </h1>
            <MotionChevrons
              variants={rotate}
              initial="closed"
              animate={activeCategories[i] ? "open" : "closed"}
            />
          </div>
          <motion.div
            variants={variants}
            initial="close"
            animate={activeCategories[i] ? "open" : "close"}
            className="w-full overflow-x-auto scrollbar-hide scroll-smooth"
          >
            <div className="w-full flex gap-4 min-w-max min-h-max">
              {products.products.map((item, i) => (
                <div
                  key={i}
                  className="w-[60vw] md:w-[350px] bg-[#1a1a1a] flex flex-col gap-4"
                >
                  <div className="w-full h-[25vh] md:h-[200px] bg-white p-4 rounded-2xl relative">
                    <Image
                      className="w-full h-full object-contain p-5 lg:p-0"
                      src={item.image_url || ""}
                      alt="product image"
                      width={200}
                      height={200}
                    />
                    <p className="absolute top-0 right-0 text-[#1a1a1a]/75 text-lg p-3 px-5">
                      ${item.price?.toFixed(0)}
                    </p>
                  </div>
                  <div className="w-full rounded-2xl p-3 bg-white text-[#1a1a1a] flex justify-between items-center">
                    <p className="w-[70%] line-clamp-1">{item.title}</p>
                    <Link
                      className="relative w-fit px-4"
                      href={item.product_url}
                      target="_blank"
                    >
                      view
                      <span>
                        <ArrowUpRight className="absolute top-0 right-0 size-4" />
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      ))}
    </div>
  );
}

export default Recommendations;
