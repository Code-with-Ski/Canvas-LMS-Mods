# Search Sub-Accounts

This feature adds the ability to search sub-accounts. It will only search accounts that are currently shown. It is recommended to use the "Expand Accounts" feature before searching. A flag icon is added next to sub-accounts that match the search phrase.

Note: With the re-design, the sub-accounts are no longer nested in the HTML structure based on their sub-account structure. Instead CSS is used to indent child sub-accounts. The option to show parent accounts of matches currently uses these differences in indent size to determine parent-child relationships. This may cause issues on smaller screens and/or when there are deeply nested sub-accounts. A better solution may be implemented in the future, but this was implemented as a quick fix to restore the functionality after the re-design.
