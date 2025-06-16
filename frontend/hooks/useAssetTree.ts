import { Asset } from "@/types/schemas/asset/Asset";
import fuzzysort from "fuzzysort";
import { useMemo } from "react";

export function useEntityAssetTree(totalEntities: Asset[]): (Asset & { children?: Asset[] })[] {
  const tree = useMemo(() => {
    const childrenMap = new Map<number | null, Asset[] & { children?: Asset[] }>();
    totalEntities.forEach(entity => {
      const key = entity.parent_id ?? -1;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(entity);
    });

    const buildTree = (parentId: number | null = -1): Asset[] & { children?: Asset[] }[] => {
      return (childrenMap.get(parentId) || []).map((entity) => {
        return {
          ...entity,
          children: buildTree(entity.id),
        };
      });
    };
    return buildTree(-1);
  }, [totalEntities]);

  return tree;

}

export function useAssetTree(totalAssets: Asset[]): (Asset & { children?: Asset[] })[] {
  return useMemo(() => {
    const childrenMap = new Map<number | null, Asset[] & { children?: Asset[] }>();
    totalAssets.forEach(asset => {
      const key = asset.parent_id ?? -1;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(asset);
    });

    const buildTree = (parentId: number | null = -1): Asset[] & { children?: Asset[] }[] => {
      return (childrenMap.get(parentId) || []).map(asset => ({
        ...asset,
        children: buildTree(asset.id),
      }));
    };

    return buildTree(-1);
  }, [totalAssets]);
}

export function useFilteredAssetTree(
  totalAssets: Asset[],
  searchTerm: string,
): (Asset & { children?: Asset[] })[] {
  return useMemo(() => {
    const result = fuzzysort.go(searchTerm, totalAssets, {
      key: "name",
      all: true,
    })

    const matched = result.map((r) => r.obj);
    const validIds = new Set<number>();
    const idMap = new Map(totalAssets.map((a) => [a.id, a]));

    matched.forEach((node) => {
      let cur: Asset | undefined = node;
      while (cur) {
        if (validIds.has(cur.id)) break;
        validIds.add(cur.id);
        cur = idMap.get(cur.parent_id);
      }
    });

    const filtered = totalAssets.filter((a) => validIds.has(a.id));
    const childrenMap = new Map<
      number | null,
      (Asset & { children?: Asset[] })[]
    >();
    filtered.forEach((asset) => {
      const key = asset.parent_id ?? -1;
      if (!childrenMap.has(key)) childrenMap.set(key, []);
      childrenMap.get(key)!.push(asset);
    });

    const buildTree = (
      parentId: number | null = -1,
    ): (Asset & { children?: Asset[] })[] =>
      (childrenMap.get(parentId) || []).map((asset) => ({
        ...asset,
        children: buildTree(asset.id),
      }));

    return buildTree(-1);
  }, [totalAssets, searchTerm]);
}