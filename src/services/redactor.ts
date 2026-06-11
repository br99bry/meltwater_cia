const REDACTION_TOKEN = "XXXX";

type RedactionRange = {
  start: number;
  end: number;
};

type RedactionMatch = RedactionRange & {
  text: string;
};

export function redactDocument(documentText: string, keywords: string[]): string {
  const matches = findRedactionMatches(documentText, keywords);

  return applyRedactions(documentText, matches, () => REDACTION_TOKEN);
}

function findRedactionMatches(documentText: string, keywords: string[]): RedactionMatch[] {
  const uniqueKeywords = [...new Set(keywords.filter((keyword) => keyword.length > 0))];
  const matches = uniqueKeywords.flatMap((keyword) => findKeywordRanges(documentText, keyword));
  const ranges = selectNonOverlappingRanges(matches);

  return ranges.map((range) => ({
    ...range,
    text: documentText.slice(range.start, range.end),
  }));
}

function applyRedactions(
  documentText: string,
  matches: RedactionMatch[],
  createReplacement: (match: RedactionMatch) => string,
): string {
  if (matches.length === 0) {
    return documentText;
  }

  let redactedText = "";
  let cursor = 0;

  for (const match of matches) {
    redactedText += documentText.slice(cursor, match.start);
    redactedText += createReplacement(match);
    cursor = match.end;
  }

  return redactedText + documentText.slice(cursor);
}

function findKeywordRanges(documentText: string, keyword: string): RedactionRange[] {
  const ranges: RedactionRange[] = [];
  let searchFrom = 0;

  while (searchFrom < documentText.length) {
    const start = documentText.indexOf(keyword, searchFrom);

    if (start === -1) {
      break;
    }

    const end = start + keyword.length;
    ranges.push({ start, end });
    searchFrom = end;
  }

  return ranges;
}

function selectNonOverlappingRanges(ranges: RedactionRange[]): RedactionRange[] {
  const selectedRanges: RedactionRange[] = [];
  const rangesByPriority = [...ranges].sort((left, right) => {
    const lengthDifference = getRangeLength(right) - getRangeLength(left);

    if (lengthDifference !== 0) {
      return lengthDifference;
    }

    return left.start - right.start;
  });

  for (const range of rangesByPriority) {
    if (!selectedRanges.some((selectedRange) => rangesOverlap(range, selectedRange))) {
      selectedRanges.push(range);
    }
  }

  return selectedRanges.sort((left, right) => left.start - right.start);
}

function getRangeLength(range: RedactionRange): number {
  return range.end - range.start;
}

function rangesOverlap(left: RedactionRange, right: RedactionRange): boolean {
  return left.start < right.end && right.start < left.end;
}
