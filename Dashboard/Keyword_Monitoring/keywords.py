from collections import Counter

# Count occurrences of flagged words
def get_flagged_words_count(flags_collection):
    flagged_words = []
    for flag_detail in flags_collection.find():
        flagged_words.extend(flag_detail['flaggedWords'])

    # Convert list to a dictionary with word counts
    flagged_words_count = dict(Counter(flagged_words).most_common(5))

    return flagged_words_count
