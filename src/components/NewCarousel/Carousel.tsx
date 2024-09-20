import s from './Carousel.module.scss'
import {FC, ReactNode, PointerEvent, useState, MouseEvent, TouchEvent, useRef, useEffect} from "react"

interface CarouselProps {
  children: ReactNode[]
  onSlideCantScrollNext: () => void
  onSlideCantScrollPrev: () => void
  activeTab: number
}

export const EmblaCarousel:FC<CarouselProps> = ({children,
  onSlideCantScrollNext, onSlideCantScrollPrev
}) => {
  const [activeSlide, setActiveSlide] = useState(0)
  const [dragging, setDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const wrapperWidth = wrapperRef.current?.offsetWidth

  const handleDown = (e: PointerEvent) => {
    setDragging(true);
    setStartX(e.clientX);
    setOffsetX(0);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) {
      setOffsetX(e.clientX - startX);
    }
  }
  const handleTouchMove = (e: TouchEvent) => {
    if (dragging) {
      setOffsetX(e.touches[0].clientX - startX);
    }
  }

  const handleEnd = () => {
    if (wrapperWidth === undefined) return
    setDragging(false);
    if (offsetX < 0 && offsetX < ((wrapperWidth*-1)/3)) {
      onNextAction()
    }
    if (offsetX > 0 && offsetX > wrapperWidth / 3) {
      onPrevAction()
    }
  }
  const handleMouseUp = () => {
    handleEnd()
  }
  const handleTouchEnd = () => {
    handleEnd()
  }

  const onPrevAction = () => {
    if (activeSlide != 0) {
      setActiveSlide((prev) => prev - 1)
    }
    if (activeSlide <= 0) {
      onSlideCantScrollPrev()
    }
  }
  const onNextAction = () => {
    if (activeSlide < children.length - 1) {
      setActiveSlide((prev) => prev + 1)
    }
    if (activeSlide >= children.length - 1) {
      onSlideCantScrollNext()
    }
  }

  const getTranslateX = () => {
    if (dragging) {
      return `calc(-${activeSlide * 100}% + ${offsetX*2}px)`
    } else {
      return `calc(-${activeSlide * 100}%)`
    }
  }
  const getThumbsArr = () => {
    const magicNumber = activeSlide > 0 ? activeSlide-1 : +activeSlide
    if (children.length <= 4) return children
    if (children.slice(magicNumber, 4+magicNumber).length < 4) return children.slice(children.length-4, children.length)
    return children.slice(magicNumber, 4+magicNumber)
  }

  useEffect(() => {
    const images = wrapperRef.current?.querySelectorAll('img')

    if (!images) return
    images.forEach(img => {
      img.draggable = false;
    });
  }, []);

  return (
    <div className={s.embla}
         ref={wrapperRef}
         onPointerDown={(e) => handleDown(e)}
         onMouseMove={(e) => handleMouseMove(e)}
         onTouchMove={(e) => handleTouchMove(e)}
         onMouseUp={handleMouseUp}
         onTouchEnd={handleTouchEnd}
    >
      <div className={s.embla__container} style={{transform: `translateX(${getTranslateX()})`}}>
        {children.map((el) => (
          <div className={s.embla__slide}
          >
            {el}
          </div>))}
      </div>
      <div className={s.thumbnails}>
        {getThumbsArr().map((el: ReactNode) => (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          <div key={el.key} className={s.thumb + (el.key == activeSlide ? ' ' + s.active : '')} onClick={() => setActiveSlide(el.key)}>{el.props.children}</div>
        ))}
      </div>
      <button className={s.embla__prev} onClick={onPrevAction}>
        <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 17.5L2 9.5L10 1.5" stroke="white" strokeWidth="2.66667" strokeLinecap="round"
                strokeLinejoin="round"/>
        </svg>
      </button>
      <button className={s.embla__next} onClick={onNextAction}>
        <svg width="12" height="19" viewBox="0 0 12 19" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 17.5L10 9.5L2 1.5" stroke="white" stroke-width="2.66667" stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
  )
}
