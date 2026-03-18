import { signup } from '../actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { AtmosphereBackground } from "@/components/ui/atmosphere-background"
import { getTranslations } from "next-intl/server"

export default async function SignupPage(props: any) {
    const searchParams = await props.searchParams;
    const error = searchParams?.error;
    const t = await getTranslations('auth.signup');

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

                    <form action={signup} className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="full_name" className="text-sm font-medium text-stone-700">{t('name')}</label>
                            <Input id="full_name" name="full_name" placeholder="Sarah Miller" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-stone-700">{t('email')}</label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-stone-700">{t('password')}</label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <div className="flex items-start space-x-3 py-2">
                            <input
                                type="checkbox"
                                id="accept_terms"
                                name="accept_terms"
                                required
                                className="mt-1 h-4 w-4 rounded border-stone-300 text-moss-600 focus:ring-moss-600 cursor-pointer"
                            />
                            <label htmlFor="accept_terms" className="text-xs text-stone-600 leading-normal cursor-pointer select-none">
                                {t('terms')} <Link href="/terms" className="text-moss-600 font-bold hover:underline">{t('termsLink')}</Link> {t('and')} <Link href="/privacy" className="text-moss-600 font-bold hover:underline">{t('privacyLink')}</Link>.
                            </label>
                        </div>
                        <Button type="submit" className="w-full bg-moss-600 hover:bg-moss-700 text-white h-11 rounded-xl shadow-sm transition-all">
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
                    {t('haveAccount')}
                    <Link href="/login" className="ml-1 font-medium text-stone-900 hover:underline underline-offset-4">
                        {t('loginLink')}
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}
