const REDACTION_TOKEN = "XXXX";

type RedactionRange = {
  start: number;
  end: number;
};

export function redactDocument(documentText: string, keywords: string[]): string {
  const ranges = findRedactionRanges(documentText, keywords);

  if (ranges.length === 0) {
    return documentText;
  }

  let redactedText = "";
  let cursor = 0;

  for (const range of ranges) {
    redactedText += documentText.slice(cursor, range.start);
    redactedText += REDACTION_TOKEN;
    cursor = range.end;
  }

  return redactedText + documentText.slice(cursor);
}

function findRedactionRanges(documentText: string, keywords: string[]): RedactionRange[] {
  const uniqueKeywords = [...new Set(keywords.filter((keyword) => keyword.length > 0))];
  const matches = uniqueKeywords.flatMap((keyword) => findKeywordRanges(documentText, keyword));

  return selectNonOverlappingRanges(matches);
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
