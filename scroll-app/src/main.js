import slides from "./slides.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  const lenis = new Lenis();
  lenis.on("scroll", ScrollTrigger.update); // ✅ 정답!
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  const slideImages = document.querySelector(".slider-images");
  const titleElement = document.getElementById("title-text");
  const exploreLink = document.querySelector(".slide-link > a");

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

  function getScaleForImage(ImageIndex, currentImageIndex, progress) {
    if (ImageIndex > currentImageIndex) return 1.25;
    if (ImageIndex < currentImageIndex - 1) return 1;

    let totalProgress =
      ImageIndex === currentImageIndex ? progress : 1 + progress;
    return 1.25 - (0.25 * totalProgress) / 2;
  }

  function animateTitleChange(index, direction) {
    if (index === currentTitleIndex) return;

    if (index < 0 || index > slides.length) return;

    if (isAnimating) {
      queuedTitleIndex = index;
      return;
    }

    isAnimating = true;
    const newTitle = slides[index].title;
    const newUrl = slides[index].url;
    const outY = direction === "down" ? "-120%" : "120%";
    const inY = direction === "down" ? "-120%" : "120%";

    gsap.killTweensOf(titleElement);

    exploreLink.href = newUrl;

    gsap.to(titleElement, {
      y: outY,
      duration: 0.5,
      ease: "power3 .out",
      onComplete: () => {
        titleElement.textContent = newTitle;
        gsap.set(titleElement, { y: inY });

        gsap.to(titleElement, {
          y: "0%",
          duration: 0.5,
          ease: "power3.out",
          onComplete: () => {
            currentTitleIndex = index;
            isAnimating = false;

            if (
              queuedTitleIndex !== null &&
              queuedTitleIndex !== currentTitleIndex
            ) {
              const nextIndex = queuedTitleIndex;
              queuedTitleIndex = null;
              animateTitleChange(nextIndex, direction);
            }
          },
        });
      },
    });
  }

  function getTitleIndexForProgress(imageProgress) {
    const imageIndex = Math.floor(imageProgress);
    const ImageSpecificProgress = imageProgress - imageIndex;

    if (ImageSpecificProgress > titleChangetThreshold) {
      return Math.min(imageIndex + 1, slides.length - 1);
    } else {
      return imageIndex;
    }
  }

  let lastImageProgress = 0;

  ScrollTrigger.create({
    trigger: ".sticky-slider",
    start: "top top",
    end: `+=${totalScrollDistance}vh`,
    pin: true,
    pinSpacing: true,
    scrub: true,
    invalidateOnRefresh: true,

    onUpdate: (self) => {
      const imageProgress = calculateImageProgress(self.progress);

      if (typeof imageProgress === "number") {
        const scrollDirection =
          imageProgress > lastImageProgress ? "down" : "up";

        const currentImageIndex = Math.floor(imageProgress);

        const ImageSpecificProgress = imageProgress - currentImageIndex;

        const correctTitleIndex = getTitleIndexForProgress(imageProgress);

        if (correctTitleIndex !== currentTitleIndex) {
          queuedTitleIndex = correctTitleIndex;
          if (!isAnimating) {
            animateTitleChange(correctTitleIndex, scrollDirection);
          }
        }

        const firstSlideImgScale = getScaleForImage(
          0,
          currentImageIndex,
          ImageSpecificProgress
        );
        firstSlideImg.style.transform = `scale(${firstSlideImgScale})`;

        for (let i = 1; i < totalSlides; i++) {
          const imgIndex = i + 1;
          const transitionIndex = imgIndex - 2;

          const imgContainer = document.getElementById(
            `img-container-${imgIndex}`
          );
          if (!imgContainer) continue;

          imgContainer.style.opacity = "1";

          const strips = imgContainer.querySelectorAll(".strip");
          const images = imgContainer.querySelectorAll("img");

          if (transitionIndex < currentImageIndex) {
            strips.forEach((strip, stripIndex) => {
              const stripPositionFromBottom = stripCount - stripIndex - 1;

              const stripUpperBound =
                stripPositionFromBottom * (100 / stripCount);

              const stripLowerBound =
                (stripPositionFromBottom + 1) * (100 / stripCount);
              strip.style.clipPath = `polygon(0% ${stripLowerBound}%, 100% ${stripLowerBound}%, 100% ${
                stripUpperBound - 0.1
              }%, 0% ${stripUpperBound - 0.1}% )`;
            });
          } else if (transitionIndex === currentImageIndex) {
            strips.forEach((strip, stripIndex) => {
              const stripPositionFromBottom = stripCount - stripIndex - 1;
              const stripUpperBound =
                stripPositionFromBottom * (100 / stripCount);

              const stripLowerBound =
                (stripPositionFromBottom + 1) * (100 / stripCount);

              const stripDelay = (stripIndex / stripCount) * 0.5;
              const adjustedProgress = Math.max(
                0,
                Math.min(1, (ImageSpecificProgress - stripDelay) * 2)
              );

              const currentStripUpperBound =
                stripLowerBound -
                (stripLowerBound - (stripUpperBound - 0.1)) * adjustedProgress;
              strip.style.clipPath = `polygon(0% ${stripLowerBound}%, 100% ${stripLowerBound}%, 100% ${currentStripUpperBound}%, 0% ${currentStripUpperBound}% )`;
            });
          } else {
            strips.forEach((strip, stripIndex) => {
              const stripPositionFromBottom = stripCount - stripIndex - 1;
              const stripLowerBound =
                (stripPositionFromBottom + 1) * (100 / stripCount);

              strip.style.clipPath = `polygon(0% ${stripLowerBound}%, 100% ${stripLowerBound}%, 100% ${stripLowerBound}%, 0% ${stripLowerBound}% )`;
            });
          }

          const imgScale = getScaleForImage(
            transitionIndex,
            currentImageIndex,
            ImageSpecificProgress
          );
          images.forEach((img) => {
            img.style.transform = `scale(${imgScale})`;
          });
        }

        lastImageProgress = imageProgress;
      }
    },
  });
});
