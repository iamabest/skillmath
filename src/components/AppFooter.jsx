export function AppFooter() {
  const year = new Date().getFullYear();
  return (
    <footer>
      <p>
        © {year} SkillMath9 — Phát triển phục vụ nâng cao chất lượng giáo dục trực quan Toán THCS.
        {' '}Theo chương trình SGK <em>Kết nối tri thức với cuộc sống</em>.
      </p>
    </footer>
  );
}
