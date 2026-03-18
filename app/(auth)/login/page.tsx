import { login, signup } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@radix-ui/react-label"
import Link from "next/link"
import { AtmosphereBackground } from "@/components/ui/atmosphere-background"
import { getTranslations } from "next-intl/server"

export default async function LoginPage(props: any) {
    const searchParams = await props.searchParams;
    const error = searchParams?.error;
    const t = await getTranslations('auth.login');

    // ...

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 py-12 relative overflow-hidden">
            <AtmosphereBackground intensity="medium" />
            {/* Home Link */}
            <div className="absolute top-8 left-8">
                <Link href="/" className="text-stone-900 font-serif font-bold text-xl">Communew.</Link>
            </div>

            <Card className="w-full max-w-md border-stone-200 shadow-soft">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-serif font-bold text-stone-900">{t('title')}</CardTitle>
                    <CardDescription className="text-stone-500">
                        {t('subtitle')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{decodeURIComponent(error)}</span>
                        </div>
                    )}

                    <form action={login} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-stone-700">{t('email')}</label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="text-sm font-medium text-stone-700">{t('password')}</label>
                                <Link href="#" className="text-xs text-stone-500 hover:text-stone-900">{t('forgotPassword')}</Link>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full bg-moss-600 hover:bg-moss-700 text-white">
                            {t('submit')}
                        </Button>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-200" /></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-stone-500">{t('orContinueWith')}</span></div>
                    </div>

                    <div className="space-y-4">
                        <Button variant="outline" className="w-full">{t('continueWithGoogle')}</Button>
                    </div>

                </CardContent>
                <CardFooter className="flex justify-center text-sm text-stone-500">
                    {t('noAccount')}
                    <Link href="/signup" className="ml-1 font-medium text-stone-900 hover:underline underline-offset-4">
                        {t('signupLink')}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
