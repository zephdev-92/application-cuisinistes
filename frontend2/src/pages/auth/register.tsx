import React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth, UserRole } from '../../contexts/auth.context';
import { RegisterData } from '../../types/user';
import AuthLayout from '../../components/layout/AuthLayout';
import { Alert } from '../../components/ui/Alert';
import { AxiosError } from 'axios';

interface RegisterFormData extends RegisterData {
  terms?: boolean;
  confirmPassword: string;
}

interface ApiErrorResponse {
  success: boolean;
  error?: string;
  errors?: Array<{ msg: string }>;
}

// Schéma de validation du formulaire
const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('Le prénom est requis')
    .min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: yup
    .string()
    .required('Le nom est requis')
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: yup.string().required("L'email est requis").email('Email invalide'),
  password: yup
    .string()
    .required('Le mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: yup.string().oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas').required('Veuillez confirmer votre mot de passe'),
  role: yup.string().oneOf(Object.values(UserRole), 'Rôle invalide'),
  phone: yup
    .string()
    .matches(
      /^(\+?\d{1,4}[\s-])?(?!0+\s+,?$)\d{9,10}\s*,?$/,
      'Numéro de téléphone invalide'
    ),
  terms: yup.boolean().oneOf([true], 'Vous devez accepter les conditions d\'utilisation'),
});

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.PRESTATAIRE,
      phone: '',
      terms: false,
    },
  });
  const { register: registerUser, error } = useAuth();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Filtrer les champs qui ne doivent pas être envoyés au serveur
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, terms, ...userData } = data;

      // Envoyer uniquement les données pertinentes
      await registerUser(data);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Détails de l\'erreur d\'inscription:', {
        message: axiosError.message,
        statusCode: axiosError.response?.status,
        data: axiosError.response?.data
      });
    }
  };

  return (
    <AuthLayout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Inscription</h1>
        {error && <Alert type="error" message={error} />}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <option value="cuisiniste">Cuisiniste</option>
              <option value="prestataire">Prestataire</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

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
