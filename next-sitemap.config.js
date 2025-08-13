// next-sitemap.config.js  (프로젝트 루트)
module.exports = {
  siteUrl: "https://www.maland-all.co.kr",
  generateRobotsTxt: true,          // robots.txt 함께 생성
  exclude: ["/tools/hunt-timer/mini"], // 검색 제외할 경로
  // 필요시 추가 사이트맵:
  // robotsTxtOptions: { additionalSitemaps: ["https://www.maland-all.co.kr/sitemap-others.xml"] },
};
