import Link from 'next/link';
import Image from 'next/image';
import Button from '@/shared/components/Button';

const features = [
  {
    index: 1,
    icon: 'goal1.png',
    title: '목표 설정부터 기록까지',
    description: '목표를 설정하고 Github repository를 \n연결하세요.',
  },
  {
    index: 2,
    icon: 'list.png',
    title: '할 일 추가하기',
    description: '목표에 추가할 issue/PR을 등록하세요.',
  },
  {
    index: 3,
    icon: 'note1.png',
    title: '학습하고 기록하기',
    description: 'Issue/PR에 관련된 노트를 기록하세요.',
  },
];

export const dynamic = 'force-static';

export default async function LandingPage() {
  return (
    <main className="w-full overflow-x-hidden">
      {/* ── Section 01 · Hero ── */}
      <section className="w-full bg-gradient-to-r from-[#C7EDE6] to-[#FBE7C6] pt-16 pb-0 md:pt-20">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center">
          <p className="text-bearlog-600 text-sm font-semibold md:text-lg">베어로그 하나로 일상부터 개발까지</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 md:text-4xl">개발자 할 일, 베어로그로 계획해요</h1>
          <Link href="/start" className="mt-8 h-fit w-fit md:mt-[56px]">
            <Button
              variant="primary"
              className="hover:bg-bearlog-500/90 h-[48px] w-[160px] text-sm md:h-[56px] md:w-[223px] md:text-base"
            >
              시작하기
            </Button>
          </Link>
        </div>

        <div className="mt-10 flex justify-center md:mt-16">
          <div className="w-full max-w-[1317px] px-6 md:px-[50px]">
            <Image
              src="/image/dashboard.png"
              alt="dashboard"
              width={1317}
              height={641}
              className="h-auto w-full rounded-2xl object-cover shadow-xl"
              priority
            />
          </div>
        </div>
      </section>

      {/* ── Section 02 · 특별한 이유 ── */}
      <section className="relative z-10 w-full bg-[#00C87F] py-14 md:py-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 md:flex-row md:items-center md:justify-between xl:justify-normal xl:gap-[216px]">
          <div className="flex flex-col text-white md:shrink-0">
            <p className="text-sm font-semibold text-[#7EFFD0] md:text-lg">자동화로 더 똑똑한 노트 관리</p>
            <h2 className="mt-3 text-2xl leading-tight font-bold md:text-4xl">베어로그가 특별한 이유</h2>
            <ul className="mt-8 flex flex-col gap-5 md:mt-[59px] md:gap-6">
              {[
                { icon: 'task-green.png', label: '편리한 모드 전환(일반/개발자)' },
                { icon: 'progress-green.png', label: 'Github 연동으로 자동화' },
                { icon: 'note.png', label: 'Github와 양방향 일정 등록' },
              ].map(({ icon, label }) => (
                <li key={label} className="flex items-center gap-4 text-base font-bold md:text-xl">
                  <Image src={`/image/${icon}`} alt={label} width={40} height={40} />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full md:max-w-[669px]">
            <Image src="/image/Group.png" alt="todo card" width={669} height={368} className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* ── Section 03 · 카드 3개 ── */}
      <section className="w-full bg-[#F8F8F8] pt-14 pb-20 md:pt-[120px]">
        <div className="mx-auto flex max-w-[1300px] flex-col items-center gap-10 px-6 md:gap-[88px]">
          <div className="text-center">
            <p className="text-bearlog-600 text-sm font-medium">목표 설정부터 기록까지</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 md:text-3xl">쉽고 빠르게 할 일을 시작해요</h2>
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-2xl bg-white px-8 pt-10 pb-12 shadow-md"
              >
                <Image src={`/image/${feature.index}.png`} alt={`${feature.index}`} width={40} height={40} />
                <div className="mt-6">
                  <Image src={`/image/${feature.icon}`} alt={feature.title} width={180} height={180} />
                </div>
                <div className="mt-8 flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-center text-sm whitespace-pre-line text-gray-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 04 · 커뮤니티 ── */}
      <section className="w-full bg-white pt-14 pb-20 lg:pt-[155px]">
        <div className="mx-auto flex max-w-[1300px] flex-col items-center px-6 lg:flex-row-reverse lg:justify-center lg:gap-16">
          {/* 텍스트 */}
          <div className="flex h-[96px] w-[316px] flex-col items-end text-right lg:ml-auto lg:h-auto lg:w-auto lg:max-w-[422px] lg:items-end lg:text-right">
            <span className="text-bearlog-600 text-sm lg:text-base">활발한 소통 게시판</span>
            <h2 className="mt-3 text-2xl font-bold text-gray-900 lg:text-4xl">
              다양한 사람들과
              <br />
              서로의 목표를 응원해요
            </h2>
          </div>

          {/* 이미지 */}
          <div className="mx-auto mt-6 w-full max-w-[500px] lg:mx-0 lg:mt-10 lg:max-w-[713px]">
            <Image
              src="/image/community.jpg"
              alt="community"
              width={713}
              height={448}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── Section 05 · CTA ── */}
      <section className="w-full bg-white py-10">
        <div className="mx-auto max-w-[1840px] px-4">
          <div className="relative flex min-h-[280px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#D5FFF0] px-6 py-16 text-center md:min-h-[518px]">
            {/* ⭐ 별 */}
            <Image
              src="/image/star.png"
              alt="star"
              width={80}
              height={80}
              className="absolute top-[18%] left-[14%] z-0 h-[28px] w-[28px] md:top-[60px] md:left-[120px] md:h-[80px] md:w-[80px] lg:top-[82px] lg:left-[326px]"
            />

            {/* 동그라미 */}
            <Image
              src="/image/dot.png"
              alt="dot"
              width={28}
              height={28}
              className="absolute top-[34%] left-[7%] z-0 h-[12px] w-[12px] md:top-56 md:left-52 md:h-[28px] md:w-[28px]"
            />

            {/* 체크 */}
            <Image
              src="/image/checkbox.png"
              alt="check"
              width={53}
              height={58}
              className="absolute right-[10%] bottom-[18%] z-0 h-[28px] w-[28px] md:top-[100px] md:right-[120px] md:bottom-auto md:h-[58px] md:w-[53px] lg:top-[223px] lg:right-[264px]"
            />

            <p className="text-bearlog-600 z-10 text-sm font-semibold">베어로그 하나로 일상부터 개발까지</p>

            <h2 className="z-10 mt-3 text-xl font-bold text-gray-900 md:text-2xl">개발자 할 일, 베어로그로 계획해요</h2>

            <Link href="/start" className="z-10">
              <Button className="mt-6 h-[56px] w-[223px] bg-[#00C87F] text-sm font-semibold hover:bg-[#00C87F]/90">
                시작하기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
