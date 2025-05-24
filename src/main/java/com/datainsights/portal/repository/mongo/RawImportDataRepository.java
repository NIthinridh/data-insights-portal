package com.datainsights.portal.repository.mongo;

import com.datainsights.portal.model.mongo.RawImportData;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RawImportDataRepository extends MongoRepository<RawImportData, String> {

    RawImportData findByImportJobId(Long importJobId);
}