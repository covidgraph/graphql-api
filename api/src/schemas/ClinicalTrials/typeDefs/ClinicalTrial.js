import { gql } from 'apollo-server';
import { cypher } from 'neo4j-graphql-js';

export const typeDefs = gql`
  type ClinicalTrial {
    "Information about privately and publicly funded clinical studies conducted around the world."

    """
    ClinicalTrials.gov identifier of the study.
    e.g. NCT04338360 
    """
    NCTId: ID! @id
    
    """
    The source of the information. Hardcoded to 'clinicaltrials.gov' for all nodes.
    """
    data_source: String!

    """
    URL to the study in clinicalTrials.gov ('https://clinicaltrials.gov/ct2/show/' + Id), where Id is the NCTId, e.g. https://www.clinicaltrials.gov/ct2/show/nct00855166
    """
    url: String!
  
    """
    A bibliographic reference in NLM's MEDLINE.    
    A "1 to many" relationship in the magitude of 1-200, e.g. one ClinicalTrial can have one or more Citations. (note: A Citation can referred in many ClinicalTrials)
    """
    refersTo: [Citation] @relation(name: "REFERS_TO", direction: OUT)

    """
    A web site directly relevant to the protocol, if applicable. 
    Does not include sites whose primary goal is to advertise or sell commercial products or services. 
    Can include links to educational, research, government, and other non-profit web pages. 
    All links are subject to review by ClinicalTrials.gov

    If exists, then a 1 to 1 relationship between the ClinicalTrial and Link
    """
    refersToUrl: [Link] @relation(name: "REFERS_TO_URL", direction: OUT)
    
    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    useReferenceAs: [ReferenceType] @relation(name: "USE_REFERENCE_AS", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """   
    conductedAt: [Facility] @relation(name: "CONDUCTED_AT", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """  
    investigates: [Intervention] @relation(name: "INVESTIGATES_INTERVENTION", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    type: [StudyType] @relation(name: "IS_TYPE", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isSponsoredBy: [Sponsor] @relation(name: "IS_SPONSORED_BY", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isSupportedBy: [Collaborator] @relation(name: "IS_SUPPORTED_BY", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isFdaRegulatedDevice: [Response] @relation(name: "IS_FDA_REGULATED_DEVICE", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """  
    isUnapprovedDevice: [Response] @relation(name: "IS_UNAPPROVED_DEVICE", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isFdaRegulatedDrug: [Response] @relation(name: "IS_FDA_REGULATED_DRUG", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    expandedAccess: [Response] @relation(name: "HAS_EXPANDED_ACCESS", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isStudying: [Condition] @relation(name: "IS_STUDYING", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isPhase: [Phase] @relation(name: "IS_PHASE", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    purpose: [Purpose] @relation(name: "HAS_PURPOSE", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    identifications: [StudyIdentification] @relation(name: "HAS_IDENTIFICATION", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    status: [Status] @relation(name: "HAS_STATUS", direction: OUT)
 
    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    stopped: [StopReason] @relation(name: "WAS_STOPPED", direction: OUT)
 
    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    started: [Start] @relation(name: "STARTED_AT", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    completed: [Completed] @relation(name: "COMPLETED_AT", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    conductedBy: [Investigator] @relation(name: "IS_CONDUCTED_BY", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    description: [Description] @relation(name: "HAS_DESCRIPTION", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    studyDesign: [Design] @relation(name: "HAS_STUDY_DESIGN", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    observationPeriod: [ObservationPeriod] @relation(name: "HAS_OBSERVATION_PERIOD", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    primaryOutcome: [Outcome] @relation(name: "HAS_PRIMARY_OUTCOME", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    secondaryOutcome: [Outcome] @relation(name: "HAS_SECONDARY_OUTCOME", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    otherOutcome: [Outcome] @relation(name: "HAS_OTHER_OUTCOME", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    studyPopulation: [StudyPopulation] @relation(name: "HAS_STUDY_POPULATION", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    inclusionCriteria: [InclusionCriteria] @relation(name: "HAS_INCLUSION_CRITERIA", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    exclusionCriteria: [ExclusionCriteria] @relation(name: "HAS_EXCLUSION_CRITERIA", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    contactPerson: [Contact] @relation(name: "HAS_CONTACT_PERSON", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    retainedBioSamples: [BioSpecimen] @relation(name: "HAS_SMAPLES_RETAINED_IN_BIOREPOSITORY", direction: OUT) #//! typo

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    studyArms: [Arm] @relation(name: "HAS_STUDY_ARMS", direction: OUT)
  }

  type Link {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    url: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "REFERS_TO_URL", direction: IN)
  }

  type ReferenceType {
"Single line description"

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id
    
    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    citations: [Citation] @relation(name: "IS_REFERENCE_TYPE", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "USE_REFERENCE_AS", direction: IN)
  }

  type Facility {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "CONDUCTED_AT", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    city: City @relation(name: "LOCATED_IN", direction: OUT)
  }

  type Intervention {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    description: String!

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    type: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "INVESTIGATES_INTERVENTION", direction: IN)
  }

  type StudyType {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    type: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "IS_TYPE", direction: IN)
  }

  type Sponsor {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "IS_SPONSORED_BY", direction: IN)
  }

  type Collaborator {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "IS_SUPPORTED_BY", direction: IN)
  }

  type Response {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    YN: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isFdaRegulatedDevice: [ClinicalTrial] @relation(name: "IS_FDA_REGULATED_DEVICE", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isUnapprovedDevice: [ClinicalTrial] @relation(name: "IS_UNAPPROVED_DEVICE", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    isFdaRegulatedDrug: [ClinicalTrial] @relation(name: "IS_FDA_REGULATED_DRUG", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    expandedAccess: [ClinicalTrial] @relation(name: "HAS_EXPANDED_ACCESS", direction: IN)
  }

  type Condition {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    disease: String! @id
    # BioBERT

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    keywords: [Keyword] @relation(name: "HAS_KEYWORD", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "IS_STUDYING", direction: IN)
  }

  type Phase {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    phase: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "IS_PHASE", direction: IN)
  }

  type Purpose {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_PURPOSE", direction: IN)
  }

  type StudyIdentification {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    studyId: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    acronym: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_IDENTIFICATION", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    title: [Title] @relation(name: "HAS_TITLE", direction: OUT)
  }

  type Title {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    briefTitle: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    officialTitle: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    identifications: [StudyIdentification] @relation(name: "HAS_TITLE", direction: IN)
  }

  type Status {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    status: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    stopReason: [StopReason] @relation(name: "HAS_REASON", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STATUS", direction: IN)
  }

  type StopReason {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    reason: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "WAS_STOPPED", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    status: [Status] @relation(name: "HAS_REASON", direction: IN)
  }

  type Start {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    date: String! @id # property is not currently a Cypher Date type

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "STARTED_AT", direction: IN)
  }

  type Completed {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    completionDate: String! @id # property is not currently a Cypher Date type
    primaryCompletionDate: String! # property is not currently a Cypher Date type

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "COMPLETED_AT", direction: IN)
  }

  type Investigator {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    affiliation: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "IS_CONDUCTED_BY", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    responsibilities: [Responsible] @relation(name: "IS_RESPOSIBLE", direction: IN)
  }

  type Responsible {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    type: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    investigator: [Investigator] @relation(name: "IS_RESPOSIBLE", direction: OUT)
  }

  type Description {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    detailed: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    summary: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_DESCRIPTION", direction: IN)
  }

  type Design {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    # no required field for lookup id
    model: String

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    description: String

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STUDY_DESIGN", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    arms: [Arm] @relation(name: "BELONGS_TO_MODEL", direction: IN)
  }

  type ObservationPeriod {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    time: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_OBSERVATION_PERIOD", direction: IN)
  }

  type Outcome {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    description: String

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    time: String!

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    type: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    primaryOutcomes: [ClinicalTrial] @relation(name: "HAS_PRIMARY_OUTCOME", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    secondaryOutcomes: [ClinicalTrial] @relation(name: "HAS_SECONDARY_OUTCOME", direction: IN)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    otherOutcomes: [ClinicalTrial] @relation(name: "HAS_OTHER_OUTCOME", direction: IN)
  }

  type StudyPopulation {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    sampling: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    genders: [Gender] @relation(name: "INCLUDES_GENDER", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    ageRanges: [AgeRange] @relation(name: "INCLUDES_AGE_RANGE", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STUDY_POPULATION", direction: IN)
  }

  type Gender {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    description: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    populations: [StudyPopulation] @relation(name: "INCLUDES_GENDER", direction: IN)
  }

  type AgeRange {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    maxAge: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    minAge: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    populations: [StudyPopulation] @relation(name: "INCLUDES_AGE_RANGE", direction: IN)
  }

  type InclusionCriteria {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    criteria: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_INCLUSION_CRITERIA", direction: IN)
  }

  type ExclusionCriteria {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    criteria: String! @id

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_EXCLUSION_CRITERIA", direction: IN)
  }

  type Contact {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    email: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_CONTACT_PERSON", direction: IN)
  }

  type BioSpecimen {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    retension: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    description: String!

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_SMAPLES_RETAINED_IN_BIOREPOSITORY", direction: IN)
  }

  type Arm {
"Single line description"
    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    name: String! @id

    """
    What is this property? Maybe an example of it.
    e.g.: ABC123
    """
    description: String

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    model: [Design] @relation(name: "BELONGS_TO_MODEL", direction: OUT)

    """
    This is relation field that links to another node. Mention cardinality 
    (eg one to many), mention what it looks like in the real data: e.g.
    if its "1 to many", how many is usual? 2? 2000?
    """
    trials: [ClinicalTrial] @relation(name: "HAS_STUDY_ARMS", direction: IN)
  }
`;
