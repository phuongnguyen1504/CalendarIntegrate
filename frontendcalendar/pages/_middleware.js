import { NextResponse } from 'next/server'
// import useStorage from '../hooks/useStorage'

export function middleware(request) {
    // const { getItem } = useStorage();
    // const isLogged = request.cookies?.isLogged
    // const isLogged = getItem("isLogged", "session");
    if (request.nextUrl.pathname == '/') {
        return NextResponse.next()
    }
    // if (!request.nextUrl.pathname.startsWith('/auth')  && !isLogged) {
    //     return NextResponse.rewrite(new URL('/auth/login', request.url))
    // }
}