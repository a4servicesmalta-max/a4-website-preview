import React from 'react'

export interface BenefitCard {
    icon: string
    title: string
    description: string
    bullets?: string[]
}

interface BenefitsCardsRowProps {
    cards: BenefitCard[]
    columns?: number
    /** The row sits on a dark section: cards alternate ink and white. */
    dark?: boolean
}

const SANS = 'var(--a4x-display)'
const BODY = 'var(--a4x-body)'
const two = (n: number) => String(n).padStart(2, '0')

/** Benefit cards in the A4 design language: numbered, 24px radius, light and dark alternating. */
const BenefitsCardsRow = ({ cards, columns = 3, dark = false }: BenefitsCardsRowProps) => {
    const min = columns === 4 ? 240 : 340

    return (
        <div
            style={{
                maxWidth: 1280,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))`,
                gap: 16,
            }}
        >
            {cards.map((card, index) => {
                const cardDark = dark ? index % 2 === 0 : index % 2 === 1
                return (
                    <div
                        key={index}
                        data-fx="rise"
                        data-d={index * 80}
                        className={`cp-card${cardDark ? ' cp-dark' : ''}`}
                        style={{ minHeight: 280, padding: 28, display: 'flex', flexDirection: 'column', gap: 14 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontFamily: SANS, fontSize: 17, fontWeight: 600, letterSpacing: '.02em', color: cardDark ? '#A1A1AA' : '#52525B' }}>
                            <span style={{ color: cardDark ? '#8B8FF7' : '#4F55F1' }}>{two(index + 1)}</span>
                            <span>/ {two(cards.length)}</span>
                        </div>
                        <div style={{ flex: 1, minHeight: 20 }} />
                        <h3 style={{ margin: 0, fontFamily: SANS, fontSize: 'clamp(24px,2.2vw,30px)', fontWeight: 600, letterSpacing: '-0.035em', lineHeight: 1.1, color: cardDark ? '#FFFFFF' : '#09090B' }}>
                            {card.title}
                        </h3>
                        <p style={{ margin: 0, fontFamily: BODY, fontSize: 15.5, lineHeight: 1.6, color: cardDark ? '#A1A1AA' : '#52525B', textWrap: 'pretty' }}>
                            {card.description}
                        </p>
                        {card.bullets && card.bullets.length > 0 && (
                            <ul style={{ margin: '4px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {card.bullets.map((item, idx) => (
                                    <li key={idx} style={{ display: 'flex', gap: 12, fontFamily: BODY, fontSize: 14.5, lineHeight: 1.5, color: cardDark ? '#D4D4D8' : '#3F3F46' }}>
                                        <span className="a4-bullet" style={cardDark ? { background: '#8B8FF7' } : undefined} />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default BenefitsCardsRow
