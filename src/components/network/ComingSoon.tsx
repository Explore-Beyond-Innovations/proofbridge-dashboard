// D4: the mainnet page before launch; it is not the "stats unavailable" state and fetches nothing.
export function ComingSoon() {
  return (
    <div className="body">
      <section className="soon">
        <h2 className="soon__title">Mainnet is coming soon</h2>
        <p className="soon__text">Its stats will show here once it launches.</p>
        <a className="button" href="/testnet">
          View our testnet stats
        </a>
      </section>
    </div>
  )
}
