import { http, HttpResponse } from 'msw';

export const handlers = [
  // 로그인
  http.post('/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (body.email === 'test@test.com' && body.password === '1234') {
      return HttpResponse.json(
        { message: '로그인 성공' },
        {
          status: 200,
          headers: {
            'Set-Cookie': 'accessToken=mock-access-token; Path=/; HttpOnly',
          },
        },
      );
    }

    return HttpResponse.json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
  }),

  // 회원가입
  http.post('/auth/signup', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };

    if (!body.email || !body.password || !body.name) {
      return HttpResponse.json({ message: '모든 항목을 입력해주세요.' }, { status: 400 });
    }

    return HttpResponse.json({ message: '회원가입 성공' }, { status: 201 });
  }),
];
