### 🍞고운세상
고운세상 사이트를 클론 코딩하였으며, React와 GSAP를 활용하여 스크롤 애니메이션과 동적 UI 인터랙션을 구현하였습니다. ScrollTrigger와 Timeline 기법을 통해 모바일과 웹에서 최적화된 사용자 경험을 제공하며, 사용자의 스크롤 동작에 맞춰 매끄럽고 시각적으로 매력적인 애니메이션 효과를 실현하였습니다. 이 프로젝트는 현대적인 웹 디자인을 반영하고, 사용자에게 몰입감 있는 인터페이스를 제공하는 데 중점을 두었습니다.

프로젝트 링크 : https://goun.vercel.app/

### ⚡Tech 
![HTML](https://img.shields.io/badge/-HTML-F05032?style=flat-square&logo=html5&logoColor=ffffff)
![CSS](https://img.shields.io/badge/-CSS-007ACC?style=flat-square&logo=css3)
![JavaScript](https://img.shields.io/badge/-JavaScript-dc8d2d?style=flat-square&logo=javascript&logoColor=ffffff)
![Swiper](https://img.shields.io/badge/swiper-6332F6?style=flat-square&logo=swiper&logoColor=ffffff)
![React](https://img.shields.io/badge/react-61DAFB?style=flat-square&logo=react&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-007ACC?style=flat-square&logo=GSAP&logoColor=white")
![i18next](https://img.shields.io/badge/i18next-16720C?style=flat-square&logo=i18next&logoColor=white")


### ⚡View 
| 메인 | 슬라이더 | 모바일 |
| :-: | :-: | :-: |
| <img src="public/images/goun1.PNG" width="200px" height="200px" align="top"> | <img src="public/images/goun2.PNG" width="200px" height="200px" align="top"> | <img src="public/images/goun3.PNG" width="200px" align="top"> |

## 📣Focus
* scrollTrigger()를 사용하여 스크롤 기반 인터랙션 구현
* isMobile 사용으로 모바일에서 최적화된 UI/UX 제공
* 반응형 웹사이트로 다양한 디바이스에서 최적화
* i18next 사용하여 다국어 지원


### ⚡Code View 
---
<br>

<img src="public/images/Animation1.gif">

<br>

```
const tl2 = gsap.timeline({
		scrollTrigger: {
			trigger: "#sec2",
			start: "top 50%"
		}
	}, 0);
	tl2.to("#sec2", {
		opacity: 1,
		duration: 1,
	}, 0);
	tl2.to("#sec2 .swiper-slide .img_box img", {
		scale: 1,
		duration: 1,
	}, 0);
```
> GSAP라이브러리의 ScrollTrigger 와 Timeline를 사용하여 전체적인 페이지를 구성하였습니다. 이 코드는 스크롤 시 #sec2 요소의 불투명도를 1로 설정하고, 내부 이미지의 크기를 원래 크기로 확대하는 애니메이션을 설정합니다. 타임라인은 #sec2가 뷰포트의 50%에 도달할 때 시작되며, 두 애니메이션은 동시에 1초 동안 진행됩니다.


<br>

---

<br>

<img src="public/images/Animation2.gif">

<br>

```
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import KOdata from "./KOdata";
import ENdata from "./ENdata";

const resources = {
  en: {
    translation: ENdata
  },
  ko: {
    translation: KOdata
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ko",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

> 이 코드는 i18next와 react-i18next를 사용하여 다국어 지원을 설정하는 것으로, 한국어(KOdata)와 영어(ENdata) 번역 데이터를 포함합니다. resources 객체를 통해 언어와 번역 데이터를 정의하고, i18n을 초기화하여 기본 언어를 한국어로 설정하며, 영어를 대체 언어로 지정합니다. 

<br>

---

<br>

```
function Navigation(p){

	const { t, i18n } = useTranslation();

	const changeLanguage = (lng) => {
		i18n.changeLanguage(lng);
	};

	return(
		<nav id="nav">
			<div className="mo_inr">
				<ul>
					{
						t("header.navi", { returnObjects: true }).map((d1, i) => (
                            <li key={i} className="gnb">
                                <a href="">{d1.depth1}</a>
                                <ul className="sub">
                                    {
                                        Array.isArray(d1.depth2) && d1.depth2.length > 0 ? (
                                            d1.depth2.map((d2, j) => (
                                                <li key={j}><a href="">{d2}</a></li>
                                            ))
                                        ) : null 
                                    }
                                </ul>
                            </li>
                        ))
					}
					<li className="utils lang">
						<a href="">{t("header.lang")}</a>
						<ul>
							<li><a href="" className="KO active" onClick={() => changeLanguage('ko')}>KO</a></li>
							<li><a href="" className="EN" onClick={() => changeLanguage('en')}>EN</a></li>
						</ul>
					</li>
				</ul>
			</div>
			
		</nav>
	)
}
```
> 이 코드는 React 컴포넌트 Navigation을 정의하여 다국어 지원이 포함된 네비게이션 바를 생성합니다. useTranslation 훅을 통해 번역 함수와 언어 변경 기능을 가져오고, t("header.navi")를 사용하여 메뉴 항목을 렌더링하며, 각 항목은 서브 메뉴를 포함할 수 있습니다. 마지막으로 언어 변경 옵션을 제공하여 클릭 시 선택된 언어로 변경하는 기능을 구현합니다.