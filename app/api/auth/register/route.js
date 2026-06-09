import userService from '@/modules/users/service/UserService';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await userService.register(body);
    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return Response.json({ error: error.message || 'Error registering user' }, { status: 400 });
  }
}
