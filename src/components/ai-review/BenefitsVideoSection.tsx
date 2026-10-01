"use client";
import React, { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import BenefitsCardsRow, { BenefitCard } from "./BenefitsCardsRow";
import { DARK_GRID, DriftGlow } from "@/components/fx/primitives";
import { useLazyMedia } from "@/hooks/use-lazy-media";
import { lazyImgProps } from "@/lib/lazy-media-props";

interface BenefitsVideoSectionProps {
    cards: BenefitCard[];
    videoSrc?: string;
    posterImage?: string;
}

const BenefitsVideoSection = ({
    cards,
    videoSrc = "/assets/videos/services/V11-Ai FS Review GIF.gif",
    posterImage = "/assets/images/RectangleV.png",
}: BenefitsVideoSectionProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Add icons manually since they are not in the translation but are part of the UI structure
    const icons = [
        '/assets/images/image 98.png',
        '/assets/images/image 103.png',
        '/assets/images/image 102.png'
    ];

    const cardsWithIcons = cards.map((card, idx) => ({
        ...card,
        icon: card.icon || icons[idx] || icons[0]
    }));

    const isGif = videoSrc?.toLowerCase().endsWith(".gif");
    const { ref: lazyRef, shouldLoad } = useLazyMedia();

    useEffect(() => {
        if (!shouldLoad || isGif) return;
        videoRef.current?.load();
    }, [shouldLoad, isGif]);

    const handleTogglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    return (
        <section style={{ position: "relative", overflow: "hidden", padding: "clamp(100px,13vw,180px) clamp(20px,5vw,72px)", background: DARK_GRID, color: "#FFFFFF" }}>
            <DriftGlow left="40%" top="-30%" strength={0.24} />
            <div style={{ position: "relative", maxWidth: 1280, margin: "0 auto" }}>
                <BenefitsCardsRow cards={cardsWithIcons} dark />

                {/* The review in motion, framed like the design's document panel */}
                <div
                    data-fx="rise"
                    data-dy="80"
                    style={{ marginTop: "clamp(48px,6vw,80px)", padding: "clamp(8px,1.2vw,14px)", borderRadius: 28, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", boxShadow: "0 50px 120px rgba(0,0,0,.45)" }}
                >
                    <div
                        ref={lazyRef}
                        style={{ position: "relative", width: "100%", borderRadius: 20, overflow: "hidden", background: "#09090B" }}
                    >
                        {isGif ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={videoSrc}
                                alt="Benefits Video Review"
                                style={{ display: "block", width: "100%", height: "auto" }}
                                {...lazyImgProps}
                            />
                        ) : (
                            <>
                                <video
                                    ref={videoRef}
                                    style={{ display: "block", width: "100%", height: "auto" }}
                                    src={shouldLoad ? videoSrc : undefined}
                                    poster={posterImage}
                                    controls={false}
                                    playsInline
                                    preload="none"
                                    muted
                                />

                                {/* Play overlay button */}
                                <button
                                    type="button"
                                    onClick={handleTogglePlay}
                                    className="cp-focus"
                                    style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", border: 0, background: "transparent", cursor: "pointer" }}
                                    aria-label={isPlaying ? "Pause video" : "Play video"}
                                >
                                    <span style={{ width: 76, height: 76, borderRadius: "50%", display: "grid", placeItems: "center", background: "#FFFFFF", boxShadow: "0 24px 60px rgba(0,0,0,.35)" }}>
                                        {isPlaying ? <Pause size={28} color="#09090B" fill="#09090B" /> : <Play size={28} color="#09090B" fill="#09090B" style={{ marginLeft: 4 }} />}
                                    </span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BenefitsVideoSection;
