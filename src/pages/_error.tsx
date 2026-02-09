function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0a0515",
      color: "#fff",
      fontFamily: "serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", marginBottom: "1rem" }}>
          {statusCode || "Error"}
        </h1>
        <p style={{ color: "#999", marginBottom: "2rem" }}>
          {statusCode === 404
            ? "お探しのページは見つかりませんでした"
            : "エラーが発生しました"}
        </p>
        <a
          href="/"
          style={{
            padding: "0.75rem 2rem",
            borderRadius: "9999px",
            background: "linear-gradient(to right, #f59e0b, #eab308)",
            color: "#000",
            fontWeight: "bold",
            textDecoration: "none",
          }}
        >
          ホームに戻る
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
