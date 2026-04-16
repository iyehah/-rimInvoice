'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Star,
  Upload,
  Loader2,
  MapPin,
  Hash,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/use-auth'
import { useBusinessProfiles } from '@/hooks/use-business-profiles'
import { useLanguage } from '@/hooks/use-language'
import { toast } from '@/hooks/use-toast'
import type { BusinessProfile } from '@/types/user'
import type { BusinessProfileStored } from '@/lib/local-business-profiles'

const emptyForm = (): BusinessProfile => ({
  storeName: '',
  logo: '',
  phone: '',
  address: '',
  email: '',
  taxId: '',
  website: '',
})

export default function ProfilePage() {
  const { user } = useAuth()
  const {
    profiles,
    defaultProfileId,
    addProfile,
    updateProfile,
    removeProfile,
    setDefaultProfile,
    convertLogoToBase64,
    refresh,
  } = useBusinessProfiles()
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'idle' | 'create' | 'edit'>('idle')
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState<BusinessProfile>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'edit' && editId) {
      const p = profiles.find((x) => x.id === editId)
      if (p) {
        setFormData({
          storeName: p.storeName || '',
          logo: p.logo || '',
          phone: p.phone || '',
          address: p.address || '',
          email: p.email || '',
          taxId: p.taxId || '',
          website: p.website || '',
        })
      }
    }
    if (mode === 'create') {
      setFormData(emptyForm())
    }
  }, [mode, editId, profiles])

  const openCreate = () => {
    setError(null)
    setMode('create')
    setEditId(null)
    setFormData(emptyForm())
  }

  const openEdit = (p: BusinessProfileStored) => {
    setError(null)
    setMode('edit')
    setEditId(p.id)
    setFormData({
      storeName: p.storeName || '',
      logo: p.logo || '',
      phone: p.phone || '',
      address: p.address || '',
      email: p.email || '',
      taxId: p.taxId || '',
      website: p.website || '',
    })
  }

  const cancelForm = () => {
    setMode('idle')
    setEditId(null)
    setFormData(emptyForm())
    setError(null)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const base64 = await convertLogoToBase64(file)
      setFormData((prev) => ({ ...prev, logo: base64 }))
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.storeName.trim()) return
    setSaving(true)
    setError(null)
    try {
      if (mode === 'create') {
        const row = addProfile(formData)
        if (!row) {
          toast({ variant: 'destructive', title: t('toast.profileSaveFailed') })
          return
        }
        toast({ title: t('toast.profileCreated') })
      } else if (mode === 'edit' && editId) {
        const ok = updateProfile(editId, formData)
        if (!ok) {
          toast({ variant: 'destructive', title: t('toast.profileSaveFailed') })
          return
        }
        toast({ title: t('toast.profileUpdated') })
      }
      refresh()
      cancelForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id: string) => {
    const ok = removeProfile(id)
    if (ok) {
      toast({ title: t('toast.profileDeleted') })
      refresh()
    } else {
      toast({ variant: 'destructive', title: t('toast.profileDeleteFailed') })
    }
  }

  return (
    <div className="space-y-8 pb-8">
      <Card className="overflow-hidden border border-border/60 bg-linear-to-br from-primary/8 via-background to-background shadow-sm">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <Avatar className="h-20 w-20 shrink-0 ring-4 ring-primary/10">
            <AvatarImage src={user?.photoURL || undefined} alt="" className="object-cover" />
            <AvatarFallback className="text-lg">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t('profile.yourAccount')}</p>
            <h2 className="truncate text-xl font-semibold">{user?.displayName || t('common.loading')}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Building2 className="h-7 w-7 text-primary" />
              {t('profile.businessesTitle')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('profile.businessesHint')}</p>
          </div>
          <Button type="button" onClick={openCreate} disabled={mode !== 'idle'} className="shrink-0 gap-2">
            <Plus className="h-4 w-4" />
            {t('profile.addBusiness')}
          </Button>
        </div>

        {profiles.length === 0 && mode === 'idle' ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-muted-foreground">{t('profile.noBusinessesYet')}</CardContent>
          </Card>
        ) : null}

        <div className="grid gap-3">
          {profiles.map((p) => (
            <Card key={p.id} className="border-border/70 transition-shadow hover:shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                    {p.logo ? (
                      <Image src={p.logo} alt="" width={48} height={48} className="h-full w-full object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-semibold">{p.storeName}</p>
                      {defaultProfileId === p.id ? (
                        <Badge variant="secondary" className="font-normal">
                          <Star className="me-1 h-3 w-3 fill-current" />
                          {t('profile.defaultBadge')}
                        </Badge>
                      ) : null}
                    </div>
                    {p.phone ? (
                      <p className="truncate text-sm text-muted-foreground">
                        {p.phone}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {defaultProfileId !== p.id ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (setDefaultProfile(p.id)) toast({ title: t('toast.profileDefaultSet') })
                        else toast({ variant: 'destructive', title: t('toast.profileDefaultFailed') })
                      }}
                    >
                      {t('profile.setDefault')}
                    </Button>
                  ) : null}
                  <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => openEdit(p)} disabled={mode !== 'idle'}>
                    <Pencil className="h-3.5 w-3.5" />
                    {t('profile.editBusiness')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" disabled={mode !== 'idle'}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('profile.deleteBusinessConfirm')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)}>{t('common.delete')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {mode !== 'idle' ? (
        <form onSubmit={handleSave}>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="border-b border-border/60 bg-muted/20">
              <CardTitle>{mode === 'create' ? t('profile.addBusiness') : t('profile.editBusiness')}</CardTitle>
              <CardDescription>{t('profile.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-6">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="space-y-2">
                  <Label>{t('profile.logo')}</Label>
                  <button
                    type="button"
                    className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted/30 transition-colors hover:border-primary/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.logo ? (
                      <Image src={formData.logo} alt="" width={96} height={96} className="h-full w-full object-contain p-1" />
                    ) : (
                      <Upload className="h-7 w-7 text-muted-foreground" />
                    )}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  <p className="max-w-[12rem] text-xs text-muted-foreground">{t('profile.logoHelp')}</p>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Label htmlFor="storeName">{t('profile.storeName')} *</Label>
                  <Input
                    id="storeName"
                    value={formData.storeName}
                    onChange={(e) => setFormData((s) => ({ ...s, storeName: e.target.value }))}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">{t('profile.storeNameDescription')}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">{t('profile.phone')}</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))} dir="ltr" className="h-11" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email">{t('client.email')}</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))} dir="ltr" className="h-11" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address">{t('profile.address')}</Label>
                  <Input id="address" value={formData.address} onChange={(e) => setFormData((s) => ({ ...s, address: e.target.value }))} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId" className="flex items-center gap-1">
                    <Hash className="h-3.5 w-3.5" />
                    {t('profile.taxId')}
                  </Label>
                  <Input id="taxId" value={formData.taxId} onChange={(e) => setFormData((s) => ({ ...s, taxId: e.target.value }))} dir="ltr" className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {t('profile.website')}
                  </Label>
                  <Input id="website" type="url" value={formData.website} onChange={(e) => setFormData((s) => ({ ...s, website: e.target.value }))} dir="ltr" placeholder="https://" className="h-11" />
                </div>
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}

              <Separator />

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={cancelForm}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" disabled={saving || !formData.storeName.trim()} className="min-w-[8rem]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                  {t('common.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      ) : null}
    </div>
  )
}
