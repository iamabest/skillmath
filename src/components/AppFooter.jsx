export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>
        © {year} PMT — Phát triển phục vụ nâng cao chất lượng giáo dục trực quan Toán THCS.
        {' '}<em>Theo chương trình SGK</em>
      </p>
    </footer>
  );
}
