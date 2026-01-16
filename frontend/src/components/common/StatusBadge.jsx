import React from 'react';

const StatusBadge = ({ statut }) => {
    const statusConfig = {
        ACTIF: {
            label: 'Actif',
            className: 'bg-green-500/20 text-green-600 dark:text-green-400'
        },
        EN_ATTENTE: {
            label: 'En attente',
            className: 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
        },
        INACTIF: {
            label: 'Inactif',
            className: 'bg-red-500/20 text-red-600 dark:text-red-400'
        }
    };

    const config = statusConfig[statut] || statusConfig.INACTIF;

    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${config.className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;