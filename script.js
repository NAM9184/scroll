import slides from "./slides";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new lenis();
  lenis.on("scroll", ScrollTrigger);
  gsap.ticker.add((item) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  const slideImages = document.querySelector(".slider-images");
  const titleElement = document.getElementById("title-text");
  const exploreLink = document.querySelector(".slide-link a");

  const totalSlides = slides.length;
  const stripCount = 25;
  let CurrentTitleIndex = 0;
});
