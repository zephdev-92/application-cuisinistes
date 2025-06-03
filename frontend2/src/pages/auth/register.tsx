import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import AuthLayout from '@/components/layout/AuthLayout';
import { authService } from '@/services/authService';
import { RegisterData, UserRole, VendeurSpecialty } from '@/types/user';

interface RegisterFormData extends RegisterData {
  terms?: boolean;
  confirmPassword: string;
}

// Interface pour les erreurs de l'API
interface ApiErrorResponse {
  success: boolean;
  error?: string;
  errors?: Array<{ msg: string }>;
}

// Schéma de validation
const schema = yup.object({
  firstName: yup.string().required('Le prénom est requis'),
  lastName: yup.string().required('Le nom est requis'),
  email: yup.string().email('Email invalide').required('L\'email est requis'),
  phone: yup.string().optional(),
  role: yup.string().required('Veuillez choisir votre rôle'),
  vendeurSpecialty: yup.string().when('role', {
    is: UserRole.VENDEUR,
    then: (schema) => schema.required('Veuillez choisir votre spécialité'),
    otherwise: (schema) => schema.optional(),
  }),
  password: yup.string()
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères')
    .required('Le mot de passe est requis'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Veuillez confirmer votre mot de passe'),
  terms: yup.boolean().oneOf([true], 'Vous devez accepter les conditions d\'utilisation'),
});

export default function Register() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      role: UserRole.PRESTATAIRE,
    },
  });

  const watchedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, terms, ...registerData } = data;
      await authService.register(registerData);
      router.push('/auth/login?message=registration-success');
    } catch (error: unknown) {
      console.error('Erreur lors de l\'inscription:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: ApiErrorResponse } };
        const errorData = axiosError.response?.data;

        if (errorData?.errors && errorData.errors.length > 0) {
          setApiError(errorData.errors.map(e => e.msg).join(', '));
        } else if (errorData?.error) {
          setApiError(errorData.error);
        } else {
          setApiError('Une erreur est survenue lors de l\'inscription');
        }
      } else {
        setApiError('Une erreur de connexion est survenue. Veuillez réessayer.');
      }
    }
  };

  return (
    <AuthLayout title="Inscription">
      <Head>
        <title>Inscription | Gestion Vendeurs</title>
        <meta name="description" content="Créer un compte sur la plateforme de gestion" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Rejoignez notre plateforme de gestion
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {apiError}
            </div>
          )}

          {/* Prénom */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              Prénom
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName')}
              className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.firstName ? 'border-red-300' : ''
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Nom */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Nom
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName')}
              className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.lastName ? 'border-red-300' : ''
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              {...register('email')}
              className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.email ? 'border-red-300' : ''
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Téléphone (optionnel)
            </label>
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.phone ? 'border-red-300' : ''
              }`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Rôle */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700"
            >
              Je suis
            </label>
            <select
              id="role"
              {...register('role')}
              className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.role ? 'border-red-300' : ''
              }`}
            >
              <option value={UserRole.VENDEUR}>Vendeur</option>
              <option value={UserRole.PRESTATAIRE}>Prestataire</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Spécialité Vendeur (conditionnel) */}
          {watchedRole === UserRole.VENDEUR && (
            <div>
              <label
                htmlFor="vendeurSpecialty"
                className="block text-sm font-medium text-gray-700"
              >
                Spécialité
              </label>
              <select
                id="vendeurSpecialty"
                {...register('vendeurSpecialty')}
                className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                  errors.vendeurSpecialty ? 'border-red-300' : ''
                }`}
              >
                <option value="">Choisissez votre spécialité</option>
                <option value={VendeurSpecialty.CUISINISTE}>Cuisiniste</option>
                <option value={VendeurSpecialty.MOBILIER}>Mobilier</option>
                <option value={VendeurSpecialty.ELECTROMENAGER}>Électroménager</option>
              </select>
              {errors.vendeurSpecialty && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.vendeurSpecialty.message}
                </p>
              )}
            </div>
          )}

          {/* Mot de passe */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.password ? 'border-red-300' : ''
              }`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirmer mot de passe */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmer mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className={`mt-1 py-1.5 pr-3 grow pl-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                errors.confirmPassword ? 'border-red-300' : ''
              }`}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Conditions d'utilisation */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                {...register('terms')}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="font-medium text-gray-700">
                J&apos;accepte les{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500">
                  conditions d&apos;utilisation
                </a>{' '}
                et la{' '}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500"
                >
                  politique de confidentialité
                </a>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.terms.message}
                </p>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Inscription en cours...' : "S'inscrire"}
            </button>
          </div>

          {/* Lien vers la page de connexion */}
          <div className="text-sm text-center mt-4">
            Vous avez déjà un compte?{' '}
            <Link
              href="/auth/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Se connecter
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
