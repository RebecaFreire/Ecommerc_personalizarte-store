import userService from '@/modules/users/service/UserService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;
    const result = await userService.login(email, password);
    return Response.json(result);
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: error.message || 'Error logging in' }, { status: 401 });
  }
}
