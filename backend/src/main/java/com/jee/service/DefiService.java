package com.jee.service;

import com.jee.DTO.defi.DefiDetailsResponse;
import com.jee.entity.Defi;
import com.jee.exceptionHandler.ApiException;
import com.jee.repository.DefiRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class DefiService {

    @Inject
    DefiRepository defiRepository;

    @Transactional
    public void createDefi(String titre, int points) {
        Defi defi = defiRepository.findByTitle(titre);
        if (defi != null) {
            throw new ApiException(409, "DEFI_ALREADY_EXISTS", "Un défi avec ce titre existe déjà");
        }
        defi = new Defi(titre, points);
        defiRepository.persist(defi);
    }

    public DefiDetailsResponse getDefiDetails(Long defiId) {
        Defi defi = defiRepository.findById(defiId);
        if (defi == null) {
            throw new ApiException(404, "DEFI_NOT_FOUND", "Défi non trouvé");
        }
        DefiDetailsResponse response = new DefiDetailsResponse();
        response.id = defi.getId();
        response.titre = defi.getTitre();
        response.points = defi.getPoints();
        return response;
    }

    public List<DefiDetailsResponse> getAllDefis() {
        List<Defi> defis = defiRepository.findAllDefis();
        return defis.stream().map(defi -> {
            DefiDetailsResponse response = new DefiDetailsResponse();
            response.id = defi.getId();
            response.titre = defi.getTitre();
            response.points = defi.getPoints();
            return response;
        }).toList();
    }



}
