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
  let currentTitleIndex = 0;
  let queuedTitleIndex = null;
  const titleChangetThreshold = 0.5;
  let isAnimating = false;

  const firstSlideImg = document.querySelector("#img-1 img");
  firstSlideImg.style.transform = "scale(1.25)";

  for (let i = 1; i < totalSlides; i++) {
    const imgContainer = document.createElement("div");
    imgContainer.className = "img-container";
    imgContainer.id = `img-container-${i + 1}`;
    imgContainer.style.opacity = "0";

    for (let j = 0; j < stripCount; j++) {
      const strip = document.createElement("div");
      strip.className = "strip";

      const img = document.createElement("img");
      img.src = slides[i].image;
      img.alt = slides[i].title;
      img.style.transform = "scale(1.25)";

      const stripPositionFromBottom = stripCount - j - 1;
      const stripLowerBound =
        (stripPositionFromBottom + 1) * (100 / stripCount);
      const stripUpperBound = stripPositionFromBottom * (100 / stripCount);

      strip.style.clipPath = `polygon(0% ,${stripLowerBound}%, 100% ${stripLowerBound}, 100% ${
        stripUpperBound - 0.1
      }%, 0% ${stripUpperBound - 0.1}%)`;

      strip.appendChild(img);
      imgContainer.appendChild(strip);
    }

    slideImages.appendChild(imgContainer);
  }

  const transitionCount = totalSlides - 1;
  const scrollDistancePerTransition = 1000;
  const initialScrollDelay = 300;
  const finalScrollDelay = 300;

  const totalScrollDistance =
    transitionCount * scrollDistancePerTransition +
    initialScrollDelay +
    finalScrollDelay;

  const transitionRanges = [];
  let currentScrollPosition = initialScrollDelay;

  for (let i = 0; i < transitionCount; i++) {
    const transitionStart = currentScrollPosition;
    const transitionEnd = transitionStart + scrollDistancePerTransition;

    transitionRanges.push({
      transition: 1,
      startVh: transitionStart,
      endVh: transitionEnd,
      startPercent: transitionStart / totalScrollDistance,
      endPercent: transitionEnd / totalScrollDistance,
    });

    currentScrollPosition = transitionEnd;
  }

  function calculateImageProgress(scrollProgress) {
    let imageProgress = 0;

    if (scrollProgress < transitionRanges[0].startPercent) {
      return 0;
    }
    if (
      scrollProgress > transitionRanges[transitionRanges.length - 1].endPercent
    ) {
      return transitionRanges.length;
    }

    for (let i = 0; i < transitionRanges.length; i++) {
      const range = transitionRanges[i];

      if (
        scrollProgress > range.startPercent &&
        scrollProgress < range.endPercent
      ) {
        const rangeSize = range.endPercent - range.startPercent;
        const normalizedProgress =
          (scrollProgress - range.startPercent) / rangeSize;
        imageProgress = i + normalizedProgress;

        break;
      } else if (scrollProgress > range.endPercent) {
        imageProgress = i + 1;
      }
    }
    return imageProgress;
  }

  function getScaleForImage() {}
  //11분24초 https://www.youtube.com/watch?v=Gi2V9Daxrcg&t=162s
});
