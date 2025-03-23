import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Alert } from '@/components/ui/Alert';

// Schéma de validation pour le formulaire de mot de passe
const passwordSchema = yup.object().shape({
  currentPassword: yup.string().required('Le mot de passe actuel est requis'),
  newPassword: yup
    .string()
    .required('Le nouveau mot de passe est requis')
    .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Les mots de passe ne correspondent pas')
    .required('Veuillez confirmer votre mot de passe'),
});

export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordFormProps {
  onSubmit: (data: PasswordFormData) => Promise<void>;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const PasswordForm: React.FC<PasswordFormProps> = ({
  onSubmit,
  loading,
  error,
  success,
}) => {
  // Configuration du formulaire de mot de passe
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PasswordFormData>({
    resolver: yupResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

// Soumission du formulaire de mot de passe
const handlePasswordSubmit = async (data: PasswordFormData) => {
    // Demander confirmation à l'utilisateur
    const confirmChange = window.confirm(
      "Après le changement de votre mot de passe, vous serez automatiquement déconnecté et redirigé vers la page de connexion. Voulez-vous continuer ?"
    );

    if (!confirmChange) {
      return; // Annuler si l'utilisateur ne confirme pas
    }

    try {
      await onSubmit(data);
      // Le formulaire n'est réinitialisé que si la soumission a réussi
      // La redirection est gérée par le composant parent
    } catch (error) {
      // Ne rien faire ici car l'erreur est déjà gérée au niveau du hook useProfile
      // et affichée via les props error/success
      console.error('Erreur de soumission du mot de passe:', error);
    }
  };

  return (
    <div>
      {error && <Alert type="error" title="Erreur" message={error} className="mb-4" />}
      {success && <Alert type="success" title="Succès" message={success} className="mb-4" />}

      <form onSubmit={handleSubmit(handlePasswordSubmit)}>
        <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Mot de passe</h3>
            <p className="mt-1 text-sm text-gray-500">
              Modifiez votre mot de passe. Nous vous recommandons d&apos;utiliser un mot de passe
              fort et unique.
            </p>
            <p className="mt-2 text-sm text-orange-600 font-medium">
              Attention : Vous serez automatiquement déconnecté après le changement de votre mot de passe.
            </p>
          </div>

          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-4">
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  {...register('currentPassword')}
                  className={`mt-1 block w-full border ${
                    errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                />
                {errors.currentPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="newPassword"
                  {...register('newPassword')}
                  className={`mt-1 block w-full border ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                />
                {errors.newPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="col-span-6 sm:col-span-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  {...register('confirmPassword')}
                  className={`mt-1 block w-full border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  } rounded-md px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none sm:text-sm`}
                />
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 md:col-span-2 md:mt-0">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'En cours...' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default React.memo(PasswordForm);
