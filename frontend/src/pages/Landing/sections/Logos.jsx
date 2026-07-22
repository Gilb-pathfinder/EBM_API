import { Fragment } from 'react'

const LOGOS = ['UMURAVA', 'KIGALI MART', 'SIMBA SUPERMARKET', 'NAKUMATT RW', 'INTARE PHARMA']

export default function Logos() {
  return (
    <div className="logos">
      <div className="logos__title">Trusted by retailers, wholesalers and pharmacies across Rwanda</div>
      <div className="logos__row">
        {LOGOS.map((name, i) => (
          <Fragment key={name}>
            <span>{name}</span>
            {i < LOGOS.length - 1 && <span>·</span>}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
