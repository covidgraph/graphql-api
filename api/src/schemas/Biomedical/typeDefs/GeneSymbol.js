import { gql } from 'apollo-server'
import { cypher } from 'neo4j-graphql-js'

export const typeDefs = gql`
    """
    GeneSymbol nodes represent common short names for genes (such as ACE2, FOXA2). There are official gene symbols that
    are linked to synonyms with a 'SYNONYM' relationship. Gene symbols are reused for other species. In most cases the same
    gene symbol in another species identifies a gene that is similar but this is not consistent. Hence, only the combination
    of a gene symbol and an identifier for the species is a unique key. The :GeneSymbol nodes have a '.taxid' property
    that identifies the species.

    Note that there are default formats for different species. Human gene symbols are all uppercase (ACE2) while
    mouse gene symbols start with a capital letter (Ace2).

    The gene symbols are linked to coresponding :Gene nodes with a 'MAPS' relationship.
    """
    type GeneSymbol {
        """
        The gene symbol.
        """
        sid: String!
        status: String
        """
        The NCBI Taxonomy ID
        """
        taxid: String!
        synonyms: [Synonym]
        synonymsSpecialCharOmitted: [SynonymSpecialCharOmitted]
        synonymsLengthOmitted: [SynonymLengthOmitted]
        synonymsWordOmitted: [SynonymWordOmitted]
        mentionedInFragments: [Fragment]
        # Mentioned in Papers
        mentionedInBodyTextFragments: [FromBodyTextMentions]
        mentionedInAbstractFragments: [FromAbstractMentions]
        # Mentioned in Patents
        mentionedInPatentDescriptions: [PatentDescriptionMentionsGeneSymbol]
        mentionedInPatentTitles: [PatentTitleMentionsGeneSymbol]
        mentionedInPatentAbstracts: [PatentAbstractMentionsGeneSymbol]
        mentionedInPatentClaims: [PatentClaimMentionsGeneSymbol]
    }

  type Synonym @relation(name: "SYNONYM", from: "synonymOf", to: "synonym") {
    synonymOf: GeneSymbol
    source: String!
    synonym: GeneSymbol
  }
`