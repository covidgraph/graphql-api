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
    The relationship between a ClinicalTrial and a type of Reference. A ClinicalTrial ca use a Reference as either background, result or derived.
    A "1 to 1" relationship
    """
    useReferenceAs: [ReferenceType] @relation(name: "USE_REFERENCE_AS", direction: OUT)

    """
    A ClinicaTrial is conducted a Facility. This can e.g. be a hospital or clinic.
    A "1 to many" relationship in the magitude of 1-900, e.g. one ClinicalTrial can be conducted at one or more facilities.
    """   
    conductedAt: [Facility] @relation(name: "CONDUCTED_AT", direction: OUT)

    """
    A ClinicalTrial has a purpose of invetigating an intervention (e.g. medication, surgery) 
    A "1 to many" relationship in the magitude of 1-30, e.g. one ClinicalTrial can investigate one or more Interventions.
    """  
    investigates: [Intervention] @relation(name: "INVESTIGATES_INTERVENTION", direction: OUT)

    """
    A CliinicaTrial can be of a certain type: Investigational, Observational or Expanded Access. 
    A 1:1 relationship.
    """
    type: [StudyType] @relation(name: "IS_TYPE", direction: OUT)

    """
    A ClinicalTrial is sponsored (i.e. paid) be someone.
    A 1:1 relationship.
    """
    isSponsoredBy: [Sponsor] @relation(name: "IS_SPONSORED_BY", direction: OUT)

    """
    A ClinicalTrial can be supported by a collaborator. 
    A 1:many relationship, in the magitude of 1-100, e.g. one ClinicalTrial can supported by one or ore collaborators.
    """
    isSupportedBy: [Collaborator] @relation(name: "IS_SUPPORTED_BY", direction: OUT)

    """
    This relationship indicates if the ClinicalTrial studies a U.S. FDA-regulated Device Product *§ (Optional for Observational Studies)
    Indication that a clinical study is studying a device product subject to section 510(k), 515, or 520(m) of the Federal Food, Drug, and Cosmetic Act. Select Yes/No.
    This is a 1:1 relationship.
    """
    isFdaRegulatedDevice: [Response] @relation(name: "IS_FDA_REGULATED_DEVICE", direction: OUT)

    """
    This relationship indicates if the ClinicalTrial investigates a device product Not Approved or Cleared by U.S. FDA *§ (formerly "Delayed Posting")
    Indication that at least one device product studied in the clinical study has not been previously approved or cleared by the U.S. Food and Drug Administration (FDA) for one or more uses. Select one.
      Yes: At least one studied FDA-regulated device product has not been previously approved or cleared by FDA
      No: All studied FDA-regulated device products have been previously approved or cleared by FDA.

    This is a 1:1 relationship.
    """  
    isUnapprovedDevice: [Response] @relation(name: "IS_UNAPPROVED_DEVICE", direction: OUT)

    """
    This relationship indicates if the ClinicalTrial studies a U.S. FDA-regulated Drug Product *§ (Optional for Observational Studies)
    Indication that a clinical study is studying a drug product (including a biological product) subject to section 505 of the Federal Food, Drug, and Cosmetic Act or to section 351 of the Public Health Service Act. Select Yes/No.
    This is a 1:1 relationship.    
    """
    isFdaRegulatedDrug: [Response] @relation(name: "IS_FDA_REGULATED_DRUG", direction: OUT)

    """
    Availability of Expanded Access.
    Whether there is expanded access to the investigational product for patients who do not qualify for enrollment in a clinical trial. 
    Expanded Access for investigational drug products (including biological products) includes all expanded access types under section 561 of the Federal Food, Drug, and Cosmetic Act: 
      (1) for individual participants, including emergency use; 
      (2) for intermediate-size participant populations; and 
      (3) under a treatment IND or treatment protocol. 

    Relationship can be one of the below:
      Yes: Investigational product is available through expanded access
      No: Investigational product is not available through expanded access
      Unknown: If the responsible party is not the sponsor of the clinical trial and manufacturer of the investigational product.
    
    This is a 1:1 relationship.
    """
    expandedAccess: [Response] @relation(name: "HAS_EXPANDED_ACCESS", direction: OUT)

    """
    A Clinical is studying / invetigting a Condition
    A "1 to many" relationship in the magitude of 1-40, e.g. one ClinicalTrial can be studying one or more conditions.
    """
    isStudying: [Condition] @relation(name: "IS_STUDYING", direction: OUT)

    """
    A ClinicalTrial of StudyType: Invetigational can be categorised as one or more phases (typically only one).
    A "1 to many" relationship in the magitude of 1-2, e.g a ClinicalTrial be Phase 1 and Phase 2 (two relationships).
    """
    isPhase: [Phase] @relation(name: "IS_PHASE", direction: OUT)

    """
    A Clinical Trial has a primary purpose for the investigation.
    This is a 1:1 relationship.
    """
    purpose: [Purpose] @relation(name: "HAS_PURPOSE", direction: OUT)

    """
    A ClinicalTrial can have an additional identification assigend by the sponsor.
    This is a 1:1 relationship.
    """
    identifications: [StudyIdentification] @relation(name: "HAS_IDENTIFICATION", direction: OUT)

    """
    A ClinicalTrial can have different recruitment status depending on progress of the study.
    This is a 1:1 relationship.
    """
    status: [Status] @relation(name: "HAS_STATUS", direction: OUT)
 
    """
    A ClinicalTrial can be prematurely stopped.
    If the ClinicalTrial was stopped this is a 1:1 relationship.
    """
    stopped: [StopReason] @relation(name: "WAS_STOPPED", direction: OUT)
 
    """
    A ClinicalTrial has a start date.
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
"The Type of the ClinicalTrial"
    """
    Interventional (clinical trial): Participants are assigned prospectively to an intervention or interventions according to a protocol to evaluate the effect of the intervention(s) on biomedical or other health related outcomes.
    Observational: Studies in human beings in which biomedical and/or health outcomes are assessed in pre-defined groups of individuals. Participants in the study may receive diagnostic, therapeutic, or other interventions, but the investigator does not assign specific interventions to the study participants. This includes when participants receive interventions as part of routine medical care, and a researcher studies the effect of the intervention.   
    Expanded Access: An investigational drug product (including biological product) available through expanded access for patients who do not qualify for enrollment in a clinical trial. Expanded Access includes all expanded access types under section 561 of the Federal Food, Drug, and Cosmetic Act: (1) for individual patients, including emergency use; (2) for intermediate-size patient populations; and (3) under a treatment IND or treatment protocol. (For more information on data requirements for this Study Type, see Expanded Access Data Element Definitions).
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
"The name of the entity or the individual who is the sponsor of the clinical study."
    """
    Limit: 160 characters.
    When a clinical study is conducted under an investigational new drug application (IND) or investigational device exemption (IDE), the IND or IDE holder is considered the sponsor. 
    When a clinical study is not conducted under an IND or IDE, the single person or entity who initiates the study, by preparing and/or planning the study, and who has authority and control over the study, is considered the sponsor.
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
"Other organizations (if any) providing support"
    """
    
    Support may include funding, design, implementation, data analysis or reporting. 
    The responsible party is responsible for confirming all collaborators before listing them.
    Limit: 160 characters.
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
"Primary Disease or Condition Being Studied in the Trial, or the Focus of the Study"
    """
    The name(s) of the disease(s) or condition(s) studied in the clinical study, or the focus of the clinical study. 
    Use, if available, appropriate descriptors from NLM's Medical Subject Headings (MeSH)-controlled vocabulary thesaurus or terms from another vocabulary, 
    such as the Systematized Nomenclature of Medicine—Clinical Terms (SNOMED CT), that has been mapped to MeSH within the Unified Medical Language System (UMLS) Metathesaurus.
    """
    disease: String! @id
    # BioBERT

    """
    Keywords
    Words or phrases that best describe the protocol. 
    Keywords help users find studies in the database. Use NLM's Medical Subject Heading (MeSH)-controlled vocabulary terms where appropriate. Be as specific and precise as possible. 
    Avoid acronyms and abbreviations.
    A "1 to many" relationship in the magitude of 1-, e.g. one ClinicalTrial can have one or more keywords.
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
"The phase of the CLinical Trial - only applicable for ClinicalTrial of StuyType:Internventional"
    """
      For a clinical trial of a drug product (including a biological product), the numerical phase of such clinical trial, consistent with terminology in 21 CFR 312.21 and in 21 CFR 312.85 for phase 4 studies. Select only one.

      N/A: Trials without phases (for example, studies of devices or behavioral interventions).
      Early Phase 1 (Formerly listed as "Phase 0"): Exploratory trials, involving very limited human exposure, with no therapeutic or diagnostic intent (e.g., screening studies, microdose studies). See FDA guidance on exploratory IND studies for more information.
      Phase 1: Includes initial studies to determine the metabolism and pharmacologic actions of drugs in humans, the side effects associated with increasing doses, and to gain early evidence of effectiveness; may include healthy participants and/or patients.
      Phase 2: Includes controlled clinical studies conducted to evaluate the effectiveness of the drug for a particular indication or indications in participants with the disease or condition under study and to determine the common short-term side effects and risks.
      Phase 3: Includes trials conducted after preliminary evidence suggesting effectiveness of the drug has been obtained, and are intended to gather additional information to evaluate the overall benefit-risk relationship of the drug.
      Phase 4: Studies of FDA-approved drugs to delineate additional information including the drug's risks, benefits, and optimal use.

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
"Primary Purpose of the ClinicalTrial"
    """
  The main objective of the intervention(s) being evaluated by the clinical trial. 
  Can be one of the below:
    Treatment: One or more interventions are being evaluated for treating a disease, syndrome, or condition.
    Prevention: One or more interventions are being assessed for preventing the development of a specific disease or health condition.
    Diagnostic: One or more interventions are being evaluated for identifying a disease or health condition.
    Supportive Care: One or more interventions are evaluated for maximizing comfort, minimizing side effects, or mitigating against a decline in the participant's health or function.
    Screening: One or more interventions are assessed or examined for identifying a condition, or risk factors for a condition, in people who are not yet known to have the condition or risk factor.
    Health Services Research: One or more interventions for evaluating the delivery, processes, management, organization, or financing of healthcare.
    Basic Science: One or more interventions for examining the basic mechanism of action (for example, physiology or biomechanics of an intervention).
    Device Feasibility: An intervention of a device product is being evaluated in a small clinical trial (generally fewer than 10 participants) to determine the feasibility of the product; or a clinical trial to test a prototype device for feasibility and not health outcomes. Such studies are conducted to confirm the design and operating specifications of a device before beginning a full clinical trial.
    Other: None of the other options applies.
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
"Unique Protocol Identification Number"
    """
    Any unique identifier assigned to the protocol by the sponsor.
    Limit: 30 characters.
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
"Overall Recruitment Status"
    """
The recruitment status for the clinical study as a whole, based upon the status of the individual sites. 
If at least one facility in a multi-site clinical study has an Individual Site Status of "Recruiting," 
then the Overall Recruitment Status for the study must be "Recruiting." 
Can be one of the below:
    Not yet recruiting: Participants are not yet being recruited
    Recruiting: Participants are currently being recruited, whether or not any participants have yet been enrolled
    Enrolling by invitation: Participants are being (or will be) selected from a predetermined population
    Active, not recruiting: Study is continuing, meaning participants are receiving an intervention or being examined, but new participants are not currently being recruited or enrolled
    Completed: The study has concluded normally; participants are no longer receiving an intervention or being examined (that is, last participant’s last visit has occurred)
    Suspended: Study halted prematurely but potentially will resume
    Terminated: Study halted prematurely and will not resume; participants are no longer being examined or receiving intervention
    Withdrawn: Study halted prematurely, prior to enrollment of first participant
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
"Why Study Stopped"
    """
    A brief explanation of the reason(s) why such clinical study was stopped (for a clinical study that is "Suspended," "Terminated," or "Withdrawn" prior to its planned completion as anticipated by the protocol).
    Limit: 250 characters.
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
"Study Start Date"
    """
    The estimated date on which the clinical study will be open for recruitment of participants, or the actual date on which the first participant was enrolled.
    Note: "Enrolled" means a participant's, or their legally authorized representative’s, agreement to participate in a clinical study following completion of the informed consent process. Potential participants who are screened for the purpose of determining eligibility for the study, but do not participate in the study, are not considered enrolled, unless otherwise specified by the protocol.
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
"Date(s) for when the ClinicalTrial Completed"
    """
    Primary Completion Date (primaryCompletionDate):
    The date that the final participant was examined or received an intervention for the purposes of final collection of data for the primary outcome, whether the clinical study concluded according to the pre-specified protocol or was terminated. 
    In the case of clinical studies with more than one primary outcome measure with different completion dates, this term refers to the date on which data collection is completed for all of the primary outcomes.
   Once the clinical study has reached the primary completion date, the responsible party must update the Primary Completion Date to reflect the actual primary completion date.

    Study Completion Date (completionDate):
    The date the final participant was examined or received an intervention for purposes of final collection of data for the primary and secondary outcome measures and adverse events (for example, last participant’s last visit), whether the clinical study concluded according to the pre-specified protocol or was terminated.
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
"An indication of whether the responsible party is the sponsor, the sponsor-investigator, or a principal investigator designated by the sponsor to be the responsible party. "
    """
    One can be selected of the below:
      Sponsor: The entity (for example, corporation or agency) that initiates the study
      Principal Investigator: The individual designated as responsible party by the sponsor (see Note)
      Sponsor-Investigator: The individual who both initiates and conducts the study
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
